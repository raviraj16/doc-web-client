# Smart Document Manager Web Client

Angular 20 based frontend enabling authentication, role‑based access control, document lifecycle management, ingestion management and RAG Q&A interactions.

## Table of Contents
1. Overview
2. Features
3. Tech Stack & Architecture
4. Project Structure
5. Prerequisites
6. Environment Configuration
7. Quick Start (Local Development)
8. Running with Docker / Docker Compose
9. Build for Production
10. Testing & Coverage
11. Linting & Formatting
12. Role‑Based Functional Guide
13. API Integration Notes
14. Security Considerations
15. Performance Recommendations
16. CI/CD Suggestions
17. Troubleshooting
18. Additional Improvements (Roadmap)

---
## 1. Overview
This client provides a responsive UI for managing users, documents, ingestion workflows and querying a knowledge base (Q&A). It uses modern Angular standalone components, typed models, and Jest for fast unit testing.

## 2. Features
- Authentication (login, registration) with session persistence.
- Role‑based routing (Admin, Editor, Viewer) using functional guards.
- User Management (Admin only): list, create, edit, deactivate (isActive), delete.
- Document Management: list, view, upload, update, delete (role restricted).
- Ingestion Management (skeleton) for pipeline monitoring.
- Q&A interface (skeleton) for retrieval augmented queries.
- Central user store with session fallback.
- HTTP interceptors (auth, error handling) (extendable).
- Comprehensive unit test suite with coverage reporting.

## 3. Tech Stack & Architecture
- Framework: Angular 20 (standalone components, functional guards)
- Language: TypeScript 5
- Module System: ES Modules
- Styling: SCSS + utility classes (light Tailwind/PostCSS infra present)
- HTTP: Angular HttpClient
- State: Lightweight custom UserStore (BehaviorSubject)
- Testing: Jest + jest-preset-angular
- Tooling: Angular CLI, Node 22
- Containerization: Docker + docker-compose (dev convenience)

### Architectural Highlights
- Standalone components remove NgModule overhead.
- Feature folders isolate domains (auth, document-management, user-management, etc.).
- Environment abstraction via `src/environments/*` for target deployments.
- Typed request/response interfaces for reliability.

## 4. Project Structure (Key Extract)
```
src/
  app/
    core/ (enums, guards, interceptors, models, services)
    features/
      auth/
      user-management/
      document-management/
      ingestion-management/
      qna/
    layout/ (main & auth layouts)
    shared/ (shared components/pipes to add)
  environments/
```

## 5. Prerequisites
- Node.js 22.x (aligned with container image)
- npm 10+ (bundled with Node 22)
- Git
- Docker & Docker Compose (optional for containerized dev)

Check versions:
```
node -v
npm -v
docker --version
```

## 6. Environment Configuration
Angular uses compile‑time environment replacement.

Files:
- `src/environments/environment.ts` (default / local dev)
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

Current variables:
| Variable | Location | Description | Example |
|----------|----------|-------------|---------|
| baseUrl  | all env files | Base API gateway / backend root URL used for all REST calls | http://localhost:3000 |

### Adding New Environment Variables
1. Add key to each relevant environment file.
2. Import from `environments/environment` where needed.
3. NEVER commit secrets; for sensitive values adopt runtime injection (e.g., JSON config endpoint) or build pipeline substitution.

### Runtime Overrides (Optional Strategy)
For deployments requiring runtime (not build) mutation, serve a `config.json` and fetch during app init (not yet implemented).

## 7. Quick Start (Local Development)
Install dependencies:
```
npm install
```
Start dev server (serves on http://localhost:4200):
```
npm start
```
Open browser: http://localhost:4200

To change API endpoint for local backend, modify `environment.ts` baseUrl.

## 8. Running with Docker / Docker Compose
Build & run dev container:
```
docker compose -f docker-compose.dev.yml up --build
```
Access app at http://localhost:4200

Stop containers:
```
docker compose -f docker-compose.dev.yml down
```

### Executing Commands Inside Container
```
docker exec -it <container_name> sh
```

## 9. Build for Production
Generate optimized build (outputs to `dist/`):
```
npm run build
```
Serve build assets via your chosen static host (Nginx, CDN). Ensure production API URL set in `environment.production.ts` before build.

## 10. Testing & Coverage
Run full test suite (verbose):
```
npm test
```
Run with coverage:
```
npm run test:coverage
```
Coverage report output: `coverage/` (HTML at `coverage/index.html`). Open in browser to inspect per-file metrics.

Recommended thresholds (enforce via future Jest config update):
- Statements >= 80%
- Branches >= 70%
- Functions >= 75%
- Lines >= 80%

### Improving Coverage
Focus on low coverage services/components (e.g., upload flows, interceptors). Add tests for error branches, null states, guards.

## 11. Linting & Formatting
(If adding ESLint later) Example commands:
```
npm run lint
```
Formatting: Prettier (HTML parser override). Configure an `.editorconfig` & Prettier config for consistency.

## 12. Role‑Based Functional Guide
| Role | Access Summary | User Management | Documents | Ingestion | Q&A |
|------|----------------|-----------------|----------|----------|-----|
| Admin  | Full system control | CRUD users (create/edit/activate/deactivate/delete) | Create / Edit / Delete / View | Full (future) | Query |
| Editor | Content curation | No access | Create / Edit / Delete / View | Limited (future) | Query |
| Viewer | Read‑only | No access | View only | View (future) | Query |

### Admin Workflow
1. Login as Admin.
2. Navigate to User Management (visible only to admins).
3. Create users (password & role required).
4. Edit user attributes & role; password optional (only change if supplied).
5. Delete (irreversible) or deactivate (if feature added to update isActive).

### Editor Workflow
- Manage documents (upload new, update metadata, delete if required), cannot access user management.

### Viewer Workflow
- Browse documents & perform Q&A. No modification actions.

## 13. API Integration Notes
Endpoints (expected):
- Auth: `/auth/login`, `/auth/signup`, `/auth/me`, `/auth/refresh`
- Users: `/user` (GET list / POST create), `/user/:id` (GET / PATCH / DELETE)
- Documents: `/document` (GET / POST), `/document/:id` (GET / PATCH / DELETE)

All base URLs prefixed by `environment.baseUrl`.

`withCredentials: true` used where session cookies or refresh flows required (login, me, refresh).

## 14. Security Considerations
- Ensure HTTPS in production (`environment.production.ts` points to TLS endpoint).
- Implement CSRF/token strategy server-side (cookies + httpOnly recommended).
- Guard all admin routes both client (current) & server (must validate role server‑side).
- Sanitize user input on backend; client performs basic form validation only.
- Consider Content Security Policy when hosting.

## 15. Performance Recommendations
- Enable Angular production build (AOT, build optimizer) for deployments.
- Introduce route level code splitting (already via lazy feature routes) for more modules.
- Add caching headers for static assets via hosting layer.
- Consider prefetching frequently accessed feature modules post-login.

## 16. CI/CD Suggestions
Pipeline Steps:
1. Install dependencies (npm ci)
2. Lint (future) & Unit tests with coverage
3. Enforce coverage thresholds
4. Build production bundle
5. Upload artifacts / deploy to hosting (S3 + CloudFront, Netlify, Vercel, etc.)
6. Smoke test environment (Cypress/E2E optional)

Example (GitHub Actions) Skeleton:
```
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

## 17. Troubleshooting
| Symptom | Possible Cause | Resolution |
|---------|----------------|------------|
| 404 on API calls | Wrong baseUrl | Update environment file / rebuild |
| CORS errors | Backend CORS misconfig | Allow origin http://localhost:4200 & credentials |
| Tests failing with DI errors | Missing testing module imports | Add `HttpClientTestingModule`, provide spies/mocks |
| Coverage low for interceptors | Untested branches | Add tests for error/token refresh paths |
| Admin nav link missing | Logged in user not admin | Inspect user store value / ensure correct role from backend |

## 18. Additional Improvements (Roadmap)
- Add ESLint + strict lint rules.
- Implement E2E tests (Cypress / Playwright).
- Add loading skeleton components and global error toasts.
- Implement runtime config fetch (config.json) for environment neutrality.
- Add pagination & filtering to User & Document lists.
- Integrate file upload progress indicators.
- Enhance accessibility (ARIA labels, focus management).
- Add dark mode theme.

---
## Appendix: Useful Commands
| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Start dev | `npm start` |
| Run tests | `npm test` |
| Coverage | `npm run test:coverage` |
| Build prod | `npm run build` |
| Docker dev | `docker compose -f docker-compose.dev.yml up --build` |

---
For questions or contributions, open an issue / PR.
