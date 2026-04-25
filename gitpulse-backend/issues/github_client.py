import os
import requests
from django.core.cache import cache

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json',
}


class GitHubRateLimitError(Exception):
    pass


class GitHubAPIError(Exception):
    pass


def _check_rate_limit(response):
    remaining = int(response.headers.get('X-RateLimit-Remaining', 1))
    reset = int(response.headers.get('X-RateLimit-Reset', 0))

    # Cache quota so frontend can display it
    cache.set('github_quota', {'remaining': remaining, 'reset_at': reset}, 60)

    print(f'GitHub API: {remaining} requests remaining. Resets at: {reset}')

    if remaining == 0:
        raise GitHubRateLimitError(f'Rate limit hit. Resets at {reset}')

    return remaining


def fetch_good_first_issues(language='python', page=1):
    url = 'https://api.github.com/search/issues'
    params = {
        'q':        f'label:"good first issue" language:{language} state:open',
        'sort':     'created',
        'order':    'desc',
        'per_page': 20,
        'page':     page,
    }
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=10)
        _check_rate_limit(response)

        if response.status_code == 401:
            raise GitHubAPIError('Invalid GitHub token. Check your .env file.')
        if response.status_code == 403:
            raise GitHubRateLimitError('GitHub rate limit exceeded.')
        if response.status_code == 422:
            raise GitHubAPIError(f'Invalid search query for language: {language}')

        response.raise_for_status()
        return response.json()

    except requests.Timeout:
        raise GitHubAPIError('GitHub API timed out. Try again in a moment.')
    except requests.ConnectionError:
        raise GitHubAPIError('Cannot reach GitHub. Check your internet connection.')


def check_issue_status(owner, repo, issue_number):
    url = f'https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}'
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        _check_rate_limit(response)
        response.raise_for_status()
        data = response.json()
        return {'state': data['state'], 'closed_at': data.get('closed_at')}
    except requests.Timeout:
        raise GitHubAPIError('GitHub sync timed out.')


def get_quota_status():
    """Return cached quota info without hitting GitHub."""
    return cache.get('github_quota', {'remaining': 'unknown', 'reset_at': 'unknown'})
