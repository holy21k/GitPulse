'use client';
import { useState, useEffect, useRef } from 'react';
import { updateClaim } from '@/lib/api';

interface TimerProps {
  claimId: number;
  initialSecs: number;
  onUpdate: (secs: number) => void;
}

export default function Timer({ claimId, initialSecs, onUpdate }: TimerProps) {
  const [secs, setSecs] = useState(initialSecs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSecs(s => s + 1), 1000);
      // Persist to backend every 30s
      syncRef.current = setInterval(() => {
        setSecs(s => {
          updateClaim(claimId, { time_spent_secs: s }).catch(() => {});
          onUpdate(s);
          return s;
        });
      }, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncRef.current) clearInterval(syncRef.current);
      // Save immediately on pause
      updateClaim(claimId, { time_spent_secs: secs }).catch(() => {});
      onUpdate(secs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncRef.current) clearInterval(syncRef.current);
    };
  }, [running]);

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="font-mono text-sm text-gray-300">{h}:{m}:{s}</span>
      <button
        onClick={() => setRunning(r => !r)}
        className={`text-xs px-2 py-0.5 rounded font-medium transition-all
          ${running ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-700 hover:bg-green-600'}`}
      >
        {running ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
