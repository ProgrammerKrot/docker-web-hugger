# Docker-Web-Hugger

Local Docker dashboard in the browser. Lists Compose projects and standalone containers, starts/stops/restarts them, and streams logs. Aimed at developers running Docker on the same host.

## Features

- FastAPI backend talks to the Docker Engine through `/var/run/docker.sock`
- Lists all containers (`all=True`) and local images
- Groups containers by `com.docker.compose.project` (Compose “Spaces”) vs standalone
- Start, stop, and restart actions (`POST /containers/{id}/action`)
- Live logs over SSE (`GET /logs/stream?containerId=...`), last 100 lines then follow
- Next.js dashboard: project cards, per-container cards, log panel with auto-scroll and retry
- Polls containers every 10s on the home page and every 5s on a project page
- Image table: tag/ID, created date, size in MB
- Multi-stage frontend image (`output: 'standalone'`) plus a Python 3.11 backend image
- Docker Compose stack: backend `:8000`, frontend `:3000`, backend healthcheck on `GET /containers`
- Unused but present: Next.js `dockerode` API routes (`/api/containers`, `/api/logs/stream`) for host-side Docker access

## Tech Stack

- **Backend:** Python 3.11, FastAPI, Uvicorn, docker (docker-py), sse-starlette
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide, dockerode (Next.js routes only)
- **Database:** None. State comes from the Docker Engine API.
- **DevOps/Infrastructure:** Docker, Docker Compose, two Dockerfiles (root + `backend/`), `.dockerignore`

## System Architecture / Database Schema

No relational schema. The source of truth is the local Docker daemon.

```
Browser  (:3000)
    │  fetch / EventSource
    ▼
Next.js UI  ──JSON/SSE──►  FastAPI  (:8000)
                              │
                              │  docker-py
                              ▼
                         Docker Engine
                         /var/run/docker.sock
```

Compose labels used for grouping:

- `com.docker.compose.project` → Space / project name
- `com.docker.compose.service` → service name (returned by the API)

Optional host path (not used by the Compose UI): Next.js Route Handlers in `src/app/api/*` call Docker via dockerode (`//./pipe/docker_engine` on Windows, `/var/run/docker.sock` elsewhere).

## Getting Started

### Prerequisites

- Docker Engine and Docker Compose
- Socket access: `/var/run/docker.sock` (Docker Desktop provides this on Windows/macOS)
- For host-side frontend/backend: Node.js 20+, Python 3.11, pip, npm

### Running Locally

```bash
git clone https://github.com/ProgrammerKrot/docker-web-hugger.git
cd docker-web-hugger

docker compose up --build

# UI:      http://localhost:3000
# API:     http://localhost:8000/containers
# Images:  http://localhost:8000/images
```

The backend container must see the host Docker socket. Compose already mounts it:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

Without Compose (two processes):

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py
# listens on 0.0.0.0:8000

# Frontend (repo root)
npm install
npm run dev
# http://localhost:3000 — browser calls http://<hostname>:8000
```

The UI builds API URLs as `http://<window.location.hostname>:8000`. Keep backend and frontend on the same host name.
