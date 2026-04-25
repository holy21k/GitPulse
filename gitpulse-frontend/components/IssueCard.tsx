import type { GitHubIssue } from '@/types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface Props {
  issue: GitHubIssue;
  claimed: boolean;
  onClaim: () => void;
}

export function IssueCard({ issue, claimed, onClaim }: Props) {
  const repo = issue.repository_url.replace('https://api.github.com/repos/', '');

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '16px 20px',
        transition: 'border-color 0.15s',
      }}
      className="hover:border-[var(--accent-blue)]"
    >
      {/* Repo name */}
      <div style={{
        fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
        letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6,
      }}>
        {repo}
      </div>

      {/* Title + Claim button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent-blue)', fontSize: 15, fontWeight: 500, lineHeight: 1.4, textDecoration: 'none' }}
          className="hover:underline"
        >
          {issue.title}
        </a>
        <button
          onClick={onClaim}
          disabled={claimed}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            border: claimed ? 'none' : '1px solid var(--accent-green)',
            background: claimed ? 'var(--bg-elevated)' : 'transparent',
            color: claimed ? 'var(--text-muted)' : 'var(--accent-green)',
            cursor: claimed ? 'default' : 'pointer',
          }}
        >
          {claimed ? '✓ Claimed' : '+ Claim'}
        </button>
      </div>

      {/* Meta + labels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {issue.comments} comments · {timeAgo(issue.created_at)}
        </span>
        {issue.labels.map(l => (
          <span
            key={l.name}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 500,
              background: `#${l.color}22`, color: `#${l.color}`,
            }}
          >
            {l.name}
          </span>
        ))}
      </div>
    </div>
  );
}
