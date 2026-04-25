# ⚡ Git-Pulse

> Stop hunting for issues. Start contributing.

Git-Pulse is a personal developer dashboard that surfaces GitHub "Good First Issues" filtered by language, lets you claim them locally, tracks time spent per issue with a live timer, and verifies when an issue is closed — all without touching the actual GitHub repo.

---

## Tech Stack

- Backend: Django 5 + Django REST Framework
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Database: SQLite (dev) / PostgreSQL (prod)
- API: GitHub REST API v3 (free, no credit card)

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A free GitHub personal access token ([get one here](https://github.com/settings/tokens) — only needs `public_repo` scope)

---

## Run Locally

### 1. Backend

```bash
cd gitpulse-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then paste your GitHub token in .env
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://localhost:8000`

### 2. Frontend

```bash
cd gitpulse-frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover/?lang=typescript` | Fetch Good First Issues (cached 5min) |
| GET | `/api/claims/` | List all claimed issues |
| POST | `/api/claims/` | Claim an issue |
| PATCH | `/api/claims/:id/` | Update status, time, or notes |
| DELETE | `/api/claims/:id/` | Remove a claim |
| GET | `/api/claims/:id/sync/` | Check if issue is closed on GitHub |
| GET | `/api/quota/` | Check remaining GitHub API quota |

---

## Features

- Language filter — TypeScript, Python, Go, Rust, JavaScript
- One-click claim system — private to your local instance
- Live timer per issue — tracks time spent, persists across refreshes
- Status workflow — Focused → Paused → Submitted → Done
- GitHub sync — verify if an issue was actually closed
- Rate limiting + caching — protects your GitHub API quota

---

## Why It's Different

Most issue finders just show you a list. Git-Pulse tracks **time spent per issue** so you can measure your growth as an open source contributor.
