'use client';
import { useState, useEffect } from 'react';
import { fetchClaims, deleteClaim } from '@/lib/api';
import { NavBar } from '@/components/NavBar';
import { StatsBar } from '@/components/StatsBar';
import { ClaimCard } from '@/components/ClaimCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import type { ClaimedIssue } from '@/types';

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

  function handleUpdate(updated: ClaimedIssue) {
    setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  async function handleDelete(id: number) {
    await deleteClaim(id);
    setClaims(prev => prev.filter(c => c.id !== id));
  }

  return (
    <>
      <NavBar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            My Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Track your claimed issues and time invested.
          </p>
        </div>

        {/* Stats */}
        {!loading && <StatsBar claims={claims} />}

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

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && claims.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'var(--text-muted)', fontSize: 14,
          }}>
            No claims yet.{' '}
            <a href="/" style={{ color: 'var(--accent-blue)' }}>
              Go discover some issues →
            </a>
          </div>
        )}

        {/* Claim cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>
    </>
  );
}
