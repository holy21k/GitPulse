from django.core.cache import cache
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ClaimedIssue
from .serializers import ClaimedIssueSerializer
from .github_client import fetch_good_first_issues, check_issue_status, get_quota_status

CACHE_TTL = 300  # 5 minutes

VALID_LANGUAGES = {'typescript', 'python', 'go', 'rust', 'javascript', 'java', 'cpp', 'ruby'}
VALID_PAGES = range(1, 11)


class DiscoverView(viewsets.ViewSet):

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request):
        lang = request.query_params.get('lang', 'python').lower().strip()
        page = request.query_params.get('page', '1')

        # Validate language
        if lang not in VALID_LANGUAGES:
            return Response(
                {'error': f'Invalid language. Choose from: {sorted(VALID_LANGUAGES)}'},
                status=400
            )

        # Validate page
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
        except Exception as e:
            return Response({'error': str(e)}, status=500)


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
        # Parse owner/repo/number from issue_url
        # e.g. https://github.com/owner/repo/issues/123
        parts = claim.issue_url.rstrip('/').split('/')
        owner, repo, issue_number = parts[-4], parts[-3], parts[-1]
        try:
            result = check_issue_status(owner, repo, issue_number)
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class QuotaView(viewsets.ViewSet):
    def list(self, request):
        return Response(get_quota_status())
