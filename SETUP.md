# SETUP.md — Collaborating on Project LINK

A guide for setting up and working on this project across multiple machines.

---

## Overview

Project LINK is a **Dockerized full-stack application**. Docker handles almost everything — you do **not** need to install Python, PostgreSQL, or Redis locally.

| Tool | Why You Need It |
|------|-----------------|
| **Git** | Clone and sync the codebase from GitHub |
| **Docker Desktop** | Runs all backend services (Python, PostgreSQL+PostGIS, Redis, Celery, Nginx) inside containers |
| **Node.js v20+** | Run the frontend dev server (`npm run dev`) — runs outside Docker for hot-reload |

- **Backend** (FastAPI + PostgreSQL + Redis + Celery) → runs entirely in Docker
- **Frontend** (React + Vite) → runs on your local machine via `npm run dev`

---

## Step-by-Step Setup on a New Machine

### Step 1 — Install Prerequisites

1. **Git** — https://git-scm.com
2. **Docker Desktop** — https://www.docker.com/products/docker-desktop
   - Windows: enable **WSL 2 backend** when prompted during install
   - Make sure Docker Desktop is **running** before proceeding
3. **Node.js v20+** — https://nodejs.org (LTS version)

Verify installations:
```bash
git --version
docker --version
docker compose version
node --version
npm --version
```

---

### Step 2 — Clone the Repository

```bash
git clone https://github.com/<your-username>/capstone-hsms.git
cd capstone-hsms
```

---

### Step 3 — Start Backend Services

```bash
docker compose up --build
```

This automatically:
- Builds the Python backend image (installs all packages from `requirements.txt`)
- Starts PostgreSQL with PostGIS extension
- Starts Redis
- Starts the FastAPI server at `http://localhost:8000`
- Starts Celery worker + beat
- Starts Nginx reverse proxy at `http://localhost:80`

> First run takes ~3–5 minutes to build. Subsequent runs are fast.

Verify the backend is up:
```bash
curl http://localhost:8000/health
```

---

### Step 4 — Run Database Migrations

In a **new terminal** while Docker is running:

```bash
docker compose exec backend alembic upgrade head
```

This creates all database tables.

---

### Step 5 — Start the Frontend

In a **new terminal**:

```bash
cd frontend
npm install        # only needed once, or after package.json changes
npm run dev        # starts Vite dev server
```

Frontend is available at `http://localhost:5173`

---

## Daily Workflow

Every day when you sit down to work:

```bash
# 1. Pull latest changes
git pull

# 2. Start backend (if not already running)
docker compose up

# 3. If new migrations were added (check git log)
docker compose exec backend alembic upgrade head

# 4. If package.json changed (check git log)
cd frontend && npm install

# 5. Start frontend dev server (separate terminal)
cd frontend && npm run dev
```

---

## Stopping Everything

```bash
# Stop all containers
docker compose down

# Stop and delete the database volume (WARNING: destroys all local data)
docker compose down -v
```

---

## Collaborating via GitHub

```bash
# Create a branch for your work
git checkout -b feature/your-feature-name

# Stage and commit
git add .
git commit -m "feat: describe what you did"

# Push to GitHub
git push origin feature/your-feature-name

# Open a Pull Request on GitHub → teammate reviews → merge to main
```

> Never push directly to `main` — always use branches and Pull Requests.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker compose up` fails — port in use | Another app is using port 8000 or 5432. Stop it or change the port in `docker-compose.yml` |
| `alembic upgrade head` fails | Database may not be ready yet. Wait a few seconds and retry |
| Frontend can't reach backend | Make sure Docker is running. Verify `http://localhost:8000/health` responds |
| `node_modules` errors | Delete `frontend/node_modules` and run `npm install` again |
| Docker build fails on Windows | Ensure WSL 2 is enabled in Docker Desktop → Settings → General |
