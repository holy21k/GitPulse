export function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-12 border-b"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--accent-blue)', fontSize: 18, fontWeight: 700 }}>
          ⚡ GitPulse
        </span>
      </div>
      <a
        href="/dashboard"
        style={{ color: 'var(--text-secondary)', fontSize: 13 }}
        className="hover:text-white transition-colors"
      >
        My Dashboard →
      </a>
    </nav>
  );
}
