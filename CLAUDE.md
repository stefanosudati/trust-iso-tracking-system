# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (node --watch, port 3002)
npm start            # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm test             # Run all tests (Vitest, 85 test)
npm run test:watch   # Watch mode
```

## Architecture

ISO 9001:2015 certification tracker — Express.js REST API + vanilla JS SPA + SQLite.

### Backend (`server/`)

- `index.js` — Express app setup, route mounting, static files, error handler
- `db.js` — SQLite (better-sqlite3) connection, schema, migrations. Uses `:memory:` in tests via `DB_PATH` env var. Tables: users, projects, changelog, clients, app_settings, api_keys
- `constants.js` — Shared constants (valid statuses, phases, themes, milestone templates, field limits, certification fields)
- `email.js` — Nodemailer wrapper for SMTP (optional). `sendMail(to, subject, html)` silently fails if SMTP not configured
- `scheduler.js` — Periodic changelog summary email scheduler. Runs daily/weekly based on app_settings
- `middleware/auth.js` — `requireAuth` (JWT + API Key dual auth) and `requireAdmin` middleware. API keys use `X-API-Key` header or `Bearer tiso_...` prefix
- `middleware/validate.js` — `validateProjectInput()`, `validateEvaluationInput()`
- `middleware/error-handler.js` — `asyncHandler()` wrapper, centralized `errorHandler()`
- `routes/auth.js` — Register, login, /me, theme, password change, tutorial-complete. First user = admin auto-approved
- `routes/admin.js` — User management (admin-only): list, create (with generated password), approve, role change, delete, changelog summary email
- `routes/clients.js` — CRUD client records. Admin sees all, non-admin sees own
- `routes/api-keys.js` — CRUD API keys. SHA-256 hash stored in DB, raw key shown once. Supports expiration (`expires_at`) and active/inactive toggle
- `routes/health.js` — Healthcheck endpoint (no auth)
- `routes/projects/` — Split into crud.js, evaluations.js, documents.js, milestones.js, changelog.js with shared helpers.js

### Frontend (`public/`)

No build tools — globals loaded via `<script>` tags in `index.html`. Load order matters.

- `js/constants.js` — Shared frontend constants (DEFAULT_EVALUATION, MANDATORY_DOCS, toast durations)
- `js/api-client.js` — REST client with local cache. `Store = ApiClient` alias for backward compat. Handles projects, clients, API keys, admin endpoints
- `js/themes.js` — Theme system with CSS variable injection (5 themes: default, trust, ocean, forest, slate)
- `js/auth.js` — Login/register UI + first-login password change flow (`password_change_required`)
- `js/tutorial.js` — 7-step onboarding wizard for new users (`has_seen_tutorial` flag)
- `js/md-export.js` — Markdown export (`GuideExport`). No PDF export
- `js/views.js` — Thin facade delegating to view modules. Contains changelog helpers (`_fieldLabel`, `_formatChangeValue`, `_renderChangelogEntries`)
- `js/app.js` — Main SPA controller, navigation, sidebar, utility methods. "Panoramica" link clears active project, logo clickable to return to overview
- `js/views/` — 10 view modules:
  - `dashboard-view.js` — Overview (all projects summary) + project dashboard (radar chart, stats)
  - `projects-view.js` — Project list + create/edit form with client dropdown
  - `project-detail-view.js` — Project detail page
  - `clause-view.js` — ISO clause view with requirements list
  - `requirement-view.js` — Single requirement evaluation (status, notes, priority, actions, evidence)
  - `documents-view.js` — SGQ document management (manual, procedures, records)
  - `timeline-view.js` — Milestones timeline (11 predefined + customizable)
  - `reports-view.js` — Reports and statistics
  - `settings-view.js` — User settings, theme picker, password change, API keys management
  - `admin-view.js` — Admin panel: user list, create user, approve, role management
- `data/iso9001.js` — ISO 9001:2015 requirements data (`CERTIFICATIONS`, `flattenRequirements`, `countRequirements`). 82 requirements across clauses 4-10

### Key Patterns

- Frontend uses global objects (not ES modules). ESLint globals are declared in `.eslintrc.json` overrides for `public/**/*.js`
- Views follow `render()` + `bind()` pattern — render returns HTML string, bind attaches event listeners
- All API calls go through `ApiClient._fetch()` which auto-handles auth headers and 401/403 logout
- Test files use ESM imports (`import from 'vitest'`) with `createRequire` for CJS server modules
- `loadProjects()` and `loadClients()` are called independently (separate try/catch) to avoid one failure blocking the other
- Clients are separate entities linked to projects via `client_id`. Client dropdown in project form populated from `Store.getClients()`

## Database Schema

Key tables:
- `users` — id, name, email, password_hash, role (admin/user), is_approved, password_change_required, has_seen_tutorial, theme
- `projects` — id, user_id, client_id, client_name, sector, ateco, employees, addresses, contacts, certification fields, phase, evaluations_json, documents_json, milestones_json
- `changelog` — project_id, requirement_id, field, old_value, new_value, changed_by, changed_at
- `clients` — id, user_id, company_name, sector, ateco, employees, addresses, contacts, notes
- `api_keys` — id, user_id, name, key_hash (SHA-256), key_prefix, is_active, expires_at
- `app_settings` — key/value store for scheduler config

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing key | — | Yes |
| `PORT` | Server port | `3002` | No |
| `DB_PATH` | SQLite file path (`:memory:` for tests) | `/data/db.sqlite` | No |
| `SMTP_HOST` | SMTP server host | — | No |
| `SMTP_USER` | SMTP username | — | No |
| `SMTP_PASS` | SMTP password | — | No |
| `SMTP_FROM` | Sender email address | — | No |
| `ADMIN_EMAIL` | Changelog summary recipient | — | No |

**IMPORTANT (Docker/Coolify):** `DB_PATH` must be absolute `/data/db.sqlite`, NOT relative `./data/db.sqlite`. The Docker volume is mounted at `/data`.

## Testing

85 tests organized in:
- `tests/health.test.js` — 1 healthcheck test
- `tests/api/auth.test.js` — 30 auth tests (register, login, password, theme, tutorial)
- `tests/api/projects.test.js` — 28 project CRUD tests
- `tests/api/admin.test.js` — 9 admin tests (create user, approve, role, delete)
- `tests/unit/validation.test.js` — 9 input validation tests
- `tests/unit/helpers.test.js` — 8 helper function tests

Tests use `DB_PATH=:memory:` for isolation. Each test file sets up its own admin user.

## Deploy

Docker multi-stage build (Alpine). Healthcheck via `GET /health`. Coolify PaaS with Traefik reverse proxy for HTTPS/TLS.

```bash
docker build -t trust-iso .
docker run -d -p 3002:3002 -e JWT_SECRET=... -v trust_data:/data trust-iso
```

First user to register becomes admin automatically.
