# Venture Atlas

A source-aware, full-stack startup intelligence library built with React, TypeScript, Vite and Express.

## Features

- Searchable startup profiles with sector and stage filters.
- Dashboard with coverage, rankings and summary metrics.
- Detailed company profiles with founders, signals and source provenance.
- Side-by-side comparison for up to three startups.
- JSON persistence, manual import and an optional live JSON-feed refresh.
- Responsive minimalist interface.

The included records are public metadata examples. Connect a verified provider before using financial or market information for decisions.

## Run locally

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000`

Production build:

```bash
npm run build
npm start
```

## Live data

Set `STARTUP_DATA_URL` to a JSON endpoint returning either `Startup[]` or `{ "startups": Startup[] }`. The API refresh endpoint upserts the feed into local JSON persistence.

## API

- `GET /api/health`
- `GET /api/meta`
- `GET /api/startups`
- `GET /api/startups/:id`
- `POST /api/import`
- `POST /api/refresh`
