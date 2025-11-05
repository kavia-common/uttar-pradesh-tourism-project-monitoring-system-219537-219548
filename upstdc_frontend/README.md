# UPSTDC Frontend (React)

Modern, responsive SPA for the Uttar Pradesh Tourism Project Monitoring System.

## Key Features Implemented

- Routing with react-router v6
- Auth store with JWT handling, persistence, and logout on 401
- RBAC-protected routes (roles: admin, pmu, engineer, auditor, contractor)
- Dashboard with KPI cards and Leaflet/OSM map
- Projects module (baseline CRUD: list, view, create/update)
- Image uploads integrated with backend local filesystem endpoint
- Reports page for file downloads
- Light/Dark theme toggle and consistent theme per style guide
- Basic tests and CI-friendly test script
- .env.example with REACT_APP_API_BASE -> backend on port 3001

## Getting Started

1. Copy environment example:
   cp .env.example .env

2. Install dependencies:
   npm install

3. Start the app:
   npm start
   App: http://localhost:3000
   Backend (expected): http://localhost:3001

If you see a message about router libraries being installed, run:
   npm ci
then retry npm start.

4. Run tests:
   npm test

## Map Dependencies

We use Leaflet via react-leaflet:
- react-leaflet
- leaflet

Leaflet CSS is imported globally in `src/index.css`. We use a CDN import (`https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`) to avoid CI/module resolution issues. If you switch to local CSS import, ensure node_modules is present before building. If you see a runtime error like "Cannot find module 'react-leaflet'", run:
- npm install

## Environment Variables

See `.env.example`. Mandatory:
- REACT_APP_API_BASE=http://localhost:3001

Optional map defaults:
- REACT_APP_DEFAULT_LAT, REACT_APP_DEFAULT_LNG, REACT_APP_DEFAULT_ZOOM

## Structure

- src/api: API client and resource helpers
- src/store: global auth store/context
- src/layout: layout and styles
- src/pages: route pages (Dashboard, Projects, Uploads, Reports, etc.)
- src/routes: ProtectedRoute
- src/components/MapView.jsx: Optional wrapper around react-leaflet with safe fallbacks

## Notes

- Authentication: POST /auth/login expected to return { access_token, user }
- Uploads: POST /uploads/images with FormData field 'file'
- Reports: GET /reports/:key returns a file (blob)
- Projects: /projects REST endpoints (list/get/create/update/delete)

Adjust endpoints to match backend when available.
