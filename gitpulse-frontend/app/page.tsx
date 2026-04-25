'use client';
import { useState, useEffect } from 'react';
import { fetchIssues, createClaim } from '@/lib/api';
import type { GitHubIssue } from '@/types';

const LANGS = ['typescript', 'python', 'go', 'rust', 'javascript'];

export default function DiscoveryPage() {
  const [issues, setIssues]   = useState<GitHubIssue[]>([]);
  const [lang, setLang]       = useState('typescript');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [claimed, setClaimed] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchIssues(lang)
      .then(data => setIssues(data.items ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [lang]);

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
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-2">⚡ Git-Pulse</h1>
      <p className="text-gray-400 mb-6">Find your next open source contribution</p>

      {/* Language Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {LANGS.map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all
              ${lang === l ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading issues...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Issue Cards */}
      <div className="grid gap-4">
        {issues.map(issue => (
          <div key={issue.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <a
                  href={issue.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline font-medium"
                >
                  {issue.title}
                </a>
                <p className="text-gray-500 text-sm mt-1">
                  {issue.repository_url.replace('https://api.github.com/repos/', '')}
                  {' · '}{issue.comments} comments
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {issue.labels.map(l => (
                    <span
                      key={l.name}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `#${l.color}22`, color: `#${l.color}` }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleClaim(issue)}
                disabled={claimed.has(issue.id)}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium
                  bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                  disabled:text-gray-500 transition-all"
              >
                {claimed.has(issue.id) ? 'Claimed ✓' : 'Claim'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/dashboard"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-500
          text-white px-5 py-3 rounded-full font-medium shadow-lg transition-all"
      >
        My Dashboard →
      </a>
    </main>
  );
}
