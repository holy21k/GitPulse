import type { ClaimedIssue, CreateClaimPayload } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchIssues(lang = 'typescript', page = 1) {
  const res = await fetch(`${BASE}/discover/?lang=${lang}&page=${page}`);

  if (res.status === 429) {
    throw new Error('Too many requests. Please wait a moment before trying again.');
  }
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

export async function fetchClaims(): Promise<ClaimedIssue[]> {
  const res = await fetch(`${BASE}/claims/`);
  if (!res.ok) throw new Error('Failed to fetch claims');
  return res.json();
}

export async function createClaim(payload: CreateClaimPayload) {
  const res = await fetch(`${BASE}/claims/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 429) {
    throw new Error('Too many requests. Please wait a moment before trying again.');
  }
  if (!res.ok) throw new Error('Failed to create claim');
  return res.json();
}

export async function updateClaim(id: number, data: Partial<ClaimedIssue>) {
  const res = await fetch(`${BASE}/claims/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update claim');
  return res.json();
}

export async function deleteClaim(id: number) {
  await fetch(`${BASE}/claims/${id}/`, { method: 'DELETE' });
}

export async function syncClaim(id: number) {
  const res = await fetch(`${BASE}/claims/${id}/sync/`);
  if (res.status === 429) {
    throw new Error('Too many requests. Please wait a moment before trying again.');
  }
  if (!res.ok) throw new Error('Sync failed');
  return res.json();
}
