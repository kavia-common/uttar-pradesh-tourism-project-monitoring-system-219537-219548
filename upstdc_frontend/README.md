# UPSTDC Frontend (React)

Modern, responsive SPA for the Uttar Pradesh Tourism Project Monitoring System.

## Key Features Implemented

- Cohesive design system with tokens (colors, spacing, radius, shadow) in `src/styles/tokens.css`
- Global UI helpers in `src/styles/ui.css`
- Updated global styles to match RFP aesthetic (primary #3b82f6, accent #06b6d4)
- Routing with react-router v6 and RBAC route guards
- Auth store with JWT handling, persistence, and logout on 401
- MainLayout with Sidebar, Topbar, Breadcrumbs, PageHeader and animated route transitions (framer-motion with safe fallback)
- Dashboard with KPI cards (`KPIStat`), lightweight chart placeholders, and enhanced Leaflet/OSM map styling via `MapView`
- Reusable UI components: `Button`, `Input`, `Table`, `Modal`, `Toast`, `Skeleton`
- Skeleton loaders for perceived performance
- Projects module (CRUD: list, view, create/update) using reusable components
- Image uploads integrated with backend local filesystem endpoint
- Reports page for file downloads
- Light/Dark theme toggle and consistent theme per style guide
- Basic tests and CI-friendly test script
- `.env.example` with `REACT_APP_API_BASE` -> backend on port 3001
- Toast system wired at App root

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

## Motion

We use framer-motion for page transitions and subtle UI motion. If the package is unavailable, the UI gracefully falls back without animation.

## Environment Variables

See `.env.example`. Mandatory:
- REACT_APP_API_BASE=http://localhost:3001

Optional map defaults:
- REACT_APP_DEFAULT_LAT, REACT_APP_DEFAULT_LNG, REACT_APP_DEFAULT_ZOOM

## Structure

- src/api: API client and resource helpers
- src/store: global auth store/context
- src/layout: layout and styles (MainLayout, Breadcrumbs, PageHeader)
- src/pages: route pages (Dashboard, Projects, Uploads, Reports, Help, Auth, Unauthorized)
- src/routes: ProtectedRoute
- src/components:
  - MapView and SkeletonCard
  - ui/: Button, Input, Table, Modal, Toast, Skeleton, KPIStat

## Notes

- Authentication: POST /auth/login expected to return { access_token, user }
- Uploads: POST /uploads/images with FormData field 'file'
- Reports: GET /reports/:key returns a file (blob)
- Projects: /projects REST endpoints (list/get/create/update/delete)

Adjust endpoints to match backend when available.
