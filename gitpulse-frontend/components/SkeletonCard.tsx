export function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '16px 20px',
      }}
    >
      <div style={{ height: 10, width: '30%', background: 'var(--bg-elevated)', borderRadius: 4, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: 16, width: '80%', background: 'var(--bg-elevated)', borderRadius: 4, marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: 10, width: '50%', background: 'var(--bg-elevated)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}
