from rest_framework import serializers
from .models import ClaimedIssue


class ClaimedIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimedIssue
        fields = '__all__'
        read_only_fields = ['claimed_at']

    def validate_github_id(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('github_id must be numeric')
        return value

    def validate_status(self, value):
        valid = {'Focused', 'Paused', 'Submitted', 'Done'}
        if value not in valid:
            raise serializers.ValidationError(f'Status must be one of: {valid}')
        return value
