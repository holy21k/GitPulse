'use client';
import { useState, useEffect } from 'react';
import { fetchClaims, updateClaim, deleteClaim, syncClaim } from '@/lib/api';
import Timer from '@/components/Timer';
import type { ClaimedIssue } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Focused:   'bg-blue-500',
  Paused:    'bg-yellow-500',
  Submitted: 'bg-purple-500',
  Done:      'bg-green-500',
};

export default function DashboardPage() {
  const [claims, setClaims]   = useState<ClaimedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchClaims()
      .then(setClaims)
      .catch(() => setError('Failed to load dashboard. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id: number, status: ClaimedIssue['status']) {
    try {
      const updated = await updateClaim(id, { status });
      setClaims(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      setError('Failed to update status.');
    }
  }

  async function handleDelete(id: number) {
    await deleteClaim(id);
    setClaims(prev => prev.filter(c => c.id !== id));
  }

  async function handleSync(id: number) {
    try {
      const result = await syncClaim(id);
      if (result.state === 'closed') changeStatus(id, 'Done');
      alert(`GitHub status: ${result.state}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Sync failed');
    }
  }

  function handleTimeUpdate(id: number, secs: number) {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, time_spent_secs: secs } : c));
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <a href="/" className="text-gray-500 hover:text-white text-sm">← Back to Discovery</a>
      <h1 className="text-3xl font-bold text-green-400 mt-4 mb-2">My Pulse Dashboard</h1>
      <p className="text-gray-400 mb-8">{claims.length} active claims</p>

      {loading && (
        <div className="flex items-center gap-3 text-gray-500 py-20 justify-center">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
          Loading your claims...
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && claims.length === 0 && (
        <div className="text-gray-600 text-center py-20">
          No claims yet. Go discover some issues!
        </div>
      )}

      <div className="grid gap-4">
        {claims.map(claim => (
          <div key={claim.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[claim.status]} mr-2`}>
                  {claim.status}
                </span>
                <a
                  href={claim.issue_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline font-medium"
                >
                  {claim.title}
                </a>
                <p className="text-gray-500 text-sm mt-1">{claim.repo_name}</p>
                <Timer
                  claimId={claim.id}
                  initialSecs={claim.time_spent_secs}
                  onUpdate={(secs) => handleTimeUpdate(claim.id, secs)}
                />
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                <select
                  value={claim.status}
                  onChange={e => changeStatus(claim.id, e.target.value as ClaimedIssue['status'])}
                  className="bg-gray-800 text-white text-sm rounded px-2 py-1"
                >
                  {['Focused', 'Paused', 'Submitted', 'Done'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSync(claim.id)}
                  className="text-xs px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded"
                >
                  Sync
                </button>
                <button
                  onClick={() => handleDelete(claim.id)}
                  className="text-xs px-3 py-1 bg-red-900 hover:bg-red-800 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
