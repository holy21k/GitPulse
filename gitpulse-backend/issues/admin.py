from django.contrib import admin
from .models import ClaimedIssue


@admin.register(ClaimedIssue)
class ClaimedIssueAdmin(admin.ModelAdmin):
    list_display    = ('title', 'repo_name', 'status', 'time_spent_secs', 'claimed_at')
    list_filter     = ('status',)
    search_fields   = ('title', 'repo_name', 'github_id')
    ordering        = ('-claimed_at',)
    readonly_fields = ('claimed_at',)
