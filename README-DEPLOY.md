Deploying Nexus Warehouse System (VPS using Docker Compose)

This guide helps you run the full stack (Postgres, backend, frontend, proxy) on a single VPS using Docker Compose and Caddy for TLS. It also explains how to make all listings publicly available.

Prerequisites
- A VPS (Ubuntu recommended) with Docker and Docker Compose installed
- A domain name (recommended for public sharing / TLS)
- Git access to this repo on the VPS (or scp the project files)

Quick start (development/test on a VPS without domain)
1. Copy the repo to the VPS and cd into the project root.
2. Review and create the backend `.env` from the example:

   cp warehouse-backend/.env.example warehouse-backend/.env
   # edit warehouse-backend/.env and set JWT_SECRET and DATABASE_URL if needed

3. Build and start services:

```bash
docker compose build
docker compose up -d
```

4. Open:
- Frontend: http://<VPS_IP>:8080
- Backend API: http://<VPS_IP>:3001/public/warehouses

Making it public with a domain and TLS (recommended)
1. Point your domain (e.g. example.com) A record to your VPS IP.
2. Edit `Caddyfile` and replace `{env.DOMAIN}` with your domain (or set env DOMAIN on the VPS).
3. Ensure ports 80 and 443 are reachable.
4. Start services; Caddy will automatically obtain TLS certificates:

```bash
export DOMAIN=example.com
docker compose build
docker compose up -d
```

Database initialization / migrations
- The repo includes `database/schema.sql` which creates the `warehouses`, `users`, and supporting tables.

To initialize the DB after the `db` container is up:

```bash
# on the host (requires psql client) or in a one-off container
docker exec -i $(docker ps -qf "name=nexus_warehouse_db") psql -U postgres -d nexusdb < database/schema.sql
```

(If you named your db service differently, adjust the container name.)

Seeding / sharing existing listings
- If you already have listings in a SQL dump, import them into the Postgres DB with `psql` as above.
- All listings are available via the public endpoint `/public/warehouses` (see `warehouse-backend/index.js`). By default the API filters `WHERE status = 'Available'`.
- To make entries visible, ensure `status` is `Available` in the `warehouses` table.

Production notes
- For scaling or managed DBs, replace the `db` service with a managed Postgres and set `DATABASE_URL` accordingly.
- For CI/CD, build and push images to a registry and update the host to `docker compose pull && docker compose up -d`.

If you want, I can:
- Run `docker compose build && docker compose up -d` here to validate builds and report errors, or
- Create a small GitHub Actions workflow to build and publish images to a registry for automated deploys.

Which would you like me to do next?

GitHub Actions (automatic build & deploy)
---------------------------------------
I added a GitHub Actions workflow at `.github/workflows/ci-cd.yml` that will:

- Build and push Docker images for the backend and frontend to GitHub Container Registry (GHCR).
- Optionally trigger a Render deploy (if you set `RENDER_API_KEY` and `RENDER_SERVICE_ID` as GitHub secrets).
- Optionally SSH to your VPS and run `docker compose up -d --build` (if you set `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, and `REMOTE_COMPOSE_DIR` secrets).

Setup steps (easy path — Render):

1. Push your repo to GitHub.
2. In your GitHub repo, go to Settings → Secrets and create the following secrets:
   - `VITE_API_URL` — your backend URL (e.g. `https://api.example.com`) (optional for demo)
   - `VITE_MAPTILER_KEY` — (optional)
   - `RENDER_API_KEY` — from Render dashboard (if using Render)
   - `RENDER_SERVICE_ID` — the service id for your web service on Render

3. When you push to `main`, GitHub Actions will run:
   - It builds both images and pushes to `ghcr.io/<your-org>/nexus-backend` and `ghcr.io/<your-org>/nexus-frontend`.
   - If `RENDER_*` secrets are set, it will trigger a Render deploy.

Render setup (step-by-step, easiest path)
----------------------------------------
Follow these steps and copy-paste the commands where indicated. I'll keep it simple — no code edits required beyond creating a repo and adding secrets.

1) Push repo to GitHub
- Create a repository on GitHub and push your local project to it. If you're unfamiliar with git commands, here's the minimal set to run in your project root:

```bash
git init
git add .
git commit -m "initial"
git branch -M main
# Replace <your-repo-url> with the URL GitHub gives you (HTTPS or SSH)
git remote add origin <your-repo-url>
git push -u origin main
```

2) Create two web services on Render:
- Go to https://dashboard.render.com
- Click "New" → "Web Service" → connect your GitHub account and select your repo.
- Create a service for the backend:
   - Name: `nexus-backend`
   - Environment: `Docker`
   - Branch: `main`
   - Build Command: leave blank (we use the Dockerfile)
   - Start Command: leave blank (Dockerfile defines it)
   - Service will build using `warehouse-backend/Dockerfile` (Render auto-detects)
- Create a second service for the frontend:
   - Name: `nexus-frontend`
   - Environment: `Docker`
   - Branch: `main`
   - Render will detect the `nexusvc-main/Dockerfile` and build it

3) Get the Render service IDs and an API key
- In the Render dashboard go to Account → API Keys → Create an API Key. Copy it.
- For each service (frontend and backend) open the service page → Settings → Service ID and copy the Service ID (looks like `srv-xxxxx`).

4) Add GitHub secrets
- In your GitHub repo: Settings → Secrets & variables → Actions → New repository secret. Add these secrets:
   - `RENDER_API_KEY`: the API key you created in Render
   - `RENDER_FRONTEND_SERVICE_ID`: Service ID for `nexus-frontend`
   - `RENDER_BACKEND_SERVICE_ID`: Service ID for `nexus-backend`
   - `VITE_API_URL`: (set to your backend URL once Render publishes — e.g. `https://nexus-backend.onrender.com`) — optional now, but recommended
   - `VITE_MAPTILER_KEY`: your MapTiler key (optional)

5) Trigger a deploy
- Push a commit to `main` (or click the workflow run button in Actions). The workflow will:
   - Build images and push them to GHCR
   - Trigger Deploys on Render for both services via the API

6) After deploy
- Render shows build logs in each service. When complete, you'll have public URLs for the backend and frontend.
- Set `VITE_API_URL` to your backend URL in the GitHub secrets and re-run the workflow if necessary so the frontend is built with the correct API URL.

Notes and troubleshooting
- If the frontend shows a blank map, check that `VITE_MAPTILER_KEY` is set and working; otherwise the workflow uses the demo map style.
- To make existing listings visible: ensure `warehouses.status` is `Available` in your Postgres DB. You can import your SQL dump into Render Postgres or into the Compose DB before migrating.


If you'd rather deploy to your VPS (advanced):

1. Generate an SSH key pair on your machine (`ssh-keygen`) and add the public key to `~/.ssh/authorized_keys` on the VPS user.
2. Add the private key to GitHub Secrets as `SSH_PRIVATE_KEY`. Also add `VPS_HOST`, `VPS_USER`, `VPS_PORT` (optional, default 22), and `REMOTE_COMPOSE_DIR` (path on the VPS where `docker-compose.yml` lives).
3. The action will SSH to the VPS and run:
   ```bash
   cd $REMOTE_COMPOSE_DIR
   docker compose pull || true
   docker compose up -d --build
   ```

Need help setting any of the secrets or connecting Render? Tell me which provider (Render or VPS) you prefer and I will:
- Create the required minimal instructions for you to copy-paste (commands and where to click) and
- Optionally run the workflow or validate with a dry run.
