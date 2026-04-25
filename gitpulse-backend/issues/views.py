import re
import logging

from django.core.cache import cache
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ClaimedIssue
from .serializers import ClaimedIssueSerializer
from .github_client import (
    fetch_good_first_issues, check_issue_status, get_quota_status,
    GitHubRateLimitError, GitHubAPIError,
)

logger = logging.getLogger(__name__)

CACHE_TTL = 300

VALID_LANGUAGES = {'typescript', 'python', 'go', 'rust', 'javascript', 'java', 'cpp', 'ruby'}
VALID_PAGES = range(1, 11)

GITHUB_URL_RE = re.compile(
    r'^https://github\.com/([\w.-]+)/([\w.-]+)/issues/(\d+)$'
)


class DiscoverView(viewsets.ViewSet):

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request):
        lang = request.query_params.get('lang', 'python').lower().strip()
        page = request.query_params.get('page', '1')

        if lang not in VALID_LANGUAGES:
            return Response(
                {'error': f'Invalid language. Choose from: {sorted(VALID_LANGUAGES)}'},
                status=400
            )

        try:
            page_num = int(page)
            if page_num not in VALID_PAGES:
                raise ValueError
        except ValueError:
            return Response({'error': 'Page must be between 1 and 10'}, status=400)

        cache_key = f'github_issues_{lang}_page{page_num}'
        cached = cache.get(cache_key)
        if cached:
            return Response({**cached, 'cached': True})

        try:
            data = fetch_good_first_issues(language=lang, page=page_num)
            cache.set(cache_key, data, CACHE_TTL)
            return Response({**data, 'cached': False})
        except GitHubRateLimitError:
            return Response({'error': 'GitHub rate limit reached. Try again later.'}, status=429)
        except GitHubAPIError as e:
            logger.error('GitHub API error: %s', str(e))
            return Response({'error': 'GitHub API error. Check server logs.'}, status=502)
        except Exception:
            logger.exception('Unexpected error in DiscoverView')
            return Response({'error': 'Internal server error.'}, status=500)


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = ClaimedIssue.objects.all().order_by('-claimed_at')
    serializer_class = ClaimedIssueSerializer

    @method_decorator(ratelimit(key='ip', rate='30/m', method=['POST'], block=True))
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    @method_decorator(ratelimit(key='ip', rate='5/m', method='GET', block=True))
    def sync(self, request, pk=None):
        claim = self.get_object()

        m = GITHUB_URL_RE.match(claim.issue_url)
        if not m:
            return Response({'error': 'Invalid issue URL'}, status=400)
        owner, repo, issue_number = m.group(1), m.group(2), m.group(3)

        try:
            result = check_issue_status(owner, repo, issue_number)
            return Response(result)
        except GitHubRateLimitError:
            return Response({'error': 'GitHub rate limit reached. Try again later.'}, status=429)
        except GitHubAPIError as e:
            logger.error('GitHub sync error: %s', str(e))
            return Response({'error': 'GitHub API error. Check server logs.'}, status=502)
        except Exception:
            logger.exception('Unexpected error in sync')
            return Response({'error': 'Internal server error.'}, status=500)


class QuotaView(viewsets.ViewSet):
    def list(self, request):
        return Response(get_quota_status())
