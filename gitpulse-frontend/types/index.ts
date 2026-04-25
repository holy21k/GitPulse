// GitHub API response shape
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  comments: number;
  created_at: string;
  labels: { name: string; color: string }[];
  repository_url: string;
}

// Django ClaimedIssue serialized shape
export interface ClaimedIssue {
  id: number;
  github_id: string;
  title: string;
  repo_name: string;
  issue_url: string;
  status: 'Focused' | 'Paused' | 'Submitted' | 'Done';
  claimed_at: string;
  time_spent_secs: number;
  notes: string;
}

// POST /api/claims/ payload
export interface CreateClaimPayload {
  github_id: string;
  title: string;
  repo_name: string;
  issue_url: string;
}
