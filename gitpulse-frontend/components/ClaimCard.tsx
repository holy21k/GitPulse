'use client';
import { useState } from 'react';
import { Timer } from './Timer';
import { syncClaim, updateClaim } from '@/lib/api';
import type { ClaimedIssue } from '@/types';

const STATUS_META: Record<string, { bg: string; color: string }> = {
  Focused:   { bg: 'var(--status-focused)',   color: 'var(--accent-blue)' },
  Paused:    { bg: 'var(--status-paused)',     color: 'var(--accent-orange)' },
  Submitted: { bg: 'var(--status-submitted)',  color: 'var(--accent-purple)' },
  Done:      { bg: 'var(--status-done)',       color: 'var(--accent-green)' },
};

interface Props {
  claim: ClaimedIssue;
  onUpdate: (updated: ClaimedIssue) => void;
  onDelete: (id: number) => void;
}

export function ClaimCard({ claim, onUpdate, onDelete }: Props) {
  const [syncing, setSyncing] = useState(false);
  const meta = STATUS_META[claim.status];

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncClaim(claim.id);
      if (result.state === 'closed') {
        const updated = await updateClaim(claim.id, { status: 'Done' });
        onUpdate(updated);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '16px 20px',
    }}>
      {/* Status badge + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{
          fontSize: 10, padding: '3px 8px', borderRadius: 10,
          fontWeight: 700, letterSpacing: '0.08em',
          background: meta.bg, color: meta.color,
        }}>
          {claim.status.toUpperCase()}
        </span>
        <a
          href={claim.issue_url}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent-blue)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          className="hover:underline"
        >
          {claim.title}
        </a>
      </div>

      {/* Repo */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        {claim.repo_name}
      </div>

      {/* Timer + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Timer
          claimId={claim.id}
          initialSecs={claim.time_spent_secs}
          onUpdate={secs => onUpdate({ ...claim, time_spent_secs: secs })}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={claim.status}
            onChange={async e => {
              const updated = await updateClaim(claim.id, { status: e.target.value as ClaimedIssue['status'] });
              onUpdate(updated);
            }}
            style={{
              background: 'var(--bg-elevated)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', borderRadius: 5,
              fontSize: 12, padding: '4px 8px',
            }}
          >
            {['Focused', 'Paused', 'Submitted', 'Done'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '4px 10px', borderRadius: 5, fontSize: 12,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: 'var(--bg-elevated)', color: 'var(--accent-purple)',
            }}
          >
            {syncing ? '...' : '↻ Sync'}
          </button>
          <button
            onClick={() => onDelete(claim.id)}
            style={{
              padding: '4px 10px', borderRadius: 5, fontSize: 12,
              border: '1px solid transparent', cursor: 'pointer',
              background: 'transparent', color: 'var(--text-muted)',
            }}
            className="hover:text-red-400"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
