'use client';
import { useState, useEffect, useRef } from 'react';
import { updateClaim } from '@/lib/api';

interface Props {
  claimId: number;
  initialSecs: number;
  onUpdate: (secs: number) => void;
}

export function Timer({ claimId, initialSecs, onUpdate }: Props) {
  const [secs, setSecs]       = useState(initialSecs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    if (running) {
      saveRef.current = setInterval(async () => {
        try {
          await updateClaim(claimId, { time_spent_secs: secs });
          onUpdate(secs);
        } catch { /* silent — retries next tick */ }
      }, 30000);
    } else {
      if (saveRef.current) clearInterval(saveRef.current);
      if (secs !== initialSecs) {
        updateClaim(claimId, { time_spent_secs: secs })
          .then(() => onUpdate(secs))
          .catch(() => {});
      }
    }
    return () => { if (saveRef.current) clearInterval(saveRef.current); };
  }, [running, secs]);

  function fmt(s: number) {
    const h   = String(Math.floor(s / 3600)).padStart(2, '0');
    const m   = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 14,
        color: running ? 'var(--accent-green)' : 'var(--text-secondary)',
        minWidth: 72,
      }}>
        {fmt(secs)}
      </span>
      <button
        onClick={() => setRunning(r => !r)}
        style={{
          padding: '4px 10px', borderRadius: 5, fontSize: 12,
          border: '1px solid var(--border)',
          background: running ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)',
          color: running ? 'var(--accent-red)' : 'var(--accent-green)',
          cursor: 'pointer',
        }}
      >
        {running ? '⏸ Pause' : '▶ Start'}
      </button>
    </div>
  );
}
