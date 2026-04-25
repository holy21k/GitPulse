'use client';
import { useState, useEffect } from 'react';
import { fetchIssues, createClaim } from '@/lib/api';
import { NavBar } from '@/components/NavBar';
import { IssueCard } from '@/components/IssueCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import type { GitHubIssue } from '@/types';

const LANGS = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python' },
  { id: 'go',         label: 'Go' },
  { id: 'rust',       label: 'Rust' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java',       label: 'Java' },
  { id: 'cpp',        label: 'C++' },
  { id: 'ruby',       label: 'Ruby' },
];

export default function DiscoveryPage() {
  const [issues, setIssues]   = useState<GitHubIssue[]>([]);
  const [lang, setLang]       = useState('typescript');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [claimed, setClaimed] = useState<Set<number>>(new Set());
  const [page, setPage]       = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setIssues([]);  // clear immediately so lang change is always visible
    setLoading(true);
    setError('');
    setPage(1);
    fetchIssues(lang, 1)
      .then(data => setIssues(data.items ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [lang]);

  async function handleLoadMore() {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const data = await fetchIssues(lang, next);
      setIssues(prev => [...prev, ...(data.items ?? [])]);
      setPage(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleClaim(issue: GitHubIssue) {
    const repoName = issue.repository_url.replace('https://api.github.com/repos/', '');
    try {
      await createClaim({
        github_id: String(issue.id),
        title: issue.title,
        repo_name: repoName,
        issue_url: issue.html_url,
      });
      setClaimed(prev => new Set(prev).add(issue.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to claim issue');
    }
  }

  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Good First Issues
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Find beginner-friendly open source issues. Claim them. Track your work.
          </p>
        </div>

        {/* Language filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {LANGS.map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              style={{
                padding: '5px 14px', borderRadius: 20,
                fontSize: 13, fontWeight: 500,
                border: lang === l.id ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                background: lang === l.id ? 'rgba(88,166,255,0.1)' : 'transparent',
                color: lang === l.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(248,81,73,0.1)', border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)', borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Issues list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading
            ? [0, 1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
            : issues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  claimed={claimed.has(issue.id)}
                  onClaim={() => handleClaim(issue)}
                />
              ))
          }
        </div>

        {/* Load more */}
        {!loading && issues.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{
                padding: '8px 24px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>

      {/* Dashboard FAB */}
      <a
        href="/dashboard"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--accent-green)', color: '#0D1117',
          padding: '10px 20px', borderRadius: 24,
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(63,185,80,0.3)',
        }}
      >
        My Dashboard →
      </a>
    </>
  );
}
