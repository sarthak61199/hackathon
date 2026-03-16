# Hackathon

## Setup

### Prerequisites

- **Client:** Node.js (v18+), npm
- **Server:** PHP 8.2+, Composer, Node.js (for Vite assets)

### Client

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env` and set:

- `VITE_MAPBOX_TOKEN` — Mapbox access token (for maps)
- `VITE_API_URL` — Backend API base URL

Then run:

```bash
npm run dev
```

App runs at `http://localhost:5173` (or the port Vite prints).

### Server

```bash
cd server
composer run setup
```

This installs PHP and npm deps, copies `.env.example` to `.env`, generates `APP_KEY`, runs migrations, and builds assets. Edit `server/.env` if you need to change DB or other settings.

Then run:

```bash
composer run dev
```

Starts the Laravel app, queue worker, logs, and Vite dev server.
