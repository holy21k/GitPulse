import type { ClaimedIssue } from '@/types';

function formatTotalTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function StatsBar({ claims }: { claims: ClaimedIssue[] }) {
  const totalSecs = claims.reduce((s, c) => s + c.time_spent_secs, 0);
  const focused   = claims.filter(c => c.status === 'Focused').length;
  const done      = claims.filter(c => c.status === 'Done').length;

  const stats = [
    { label: 'TOTAL CLAIMS',  value: claims.length,              color: undefined },
    { label: 'TIME INVESTED', value: formatTotalTime(totalSecs), color: undefined },
    { label: 'IN PROGRESS',   value: focused,                    color: 'var(--accent-blue)' },
    { label: 'COMPLETED',     value: done,                       color: 'var(--accent-green)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
      {stats.map(s => (
        <div
          key={s.label}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 20px',
          }}
        >
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8,
          }}>
            {s.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: s.color ?? 'var(--text-primary)' }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
