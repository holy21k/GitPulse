from rest_framework import serializers
from .models import ClaimedIssue


class ClaimedIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimedIssue
        fields = '__all__'
        read_only_fields = ['claimed_at']
