from django.db import models


class ClaimedIssue(models.Model):
    STATUS_CHOICES = [
        ('Focused',   'Focused'),
        ('Paused',    'Paused'),
        ('Submitted', 'Submitted'),
        ('Done',      'Done'),
    ]

    github_id       = models.CharField(max_length=255, unique=True)
    title           = models.CharField(max_length=500)
    repo_name       = models.CharField(max_length=255)
    issue_url       = models.URLField()
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Focused')
    claimed_at      = models.DateTimeField(auto_now_add=True)
    time_spent_secs = models.IntegerField(default=0)
    notes           = models.TextField(blank=True, max_length=5000)

    def __str__(self):
        return f'{self.repo_name} — {self.title[:50]}'
