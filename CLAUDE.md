# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (nodemon, port 3000)
npm start            # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm test             # Run all tests (Vitest)
npm run test:watch   # Watch mode
```

## Architecture

ISO 9001:2015 certification tracker — Express.js REST API + vanilla JS SPA + SQLite.

### Backend (`server/`)

- `index.js` — Express app setup, route mounting, error handler
- `db.js` — SQLite (better-sqlite3) connection, schema, migrations. Uses `:memory:` in tests via `DB_PATH` env var
- `constants.js` — Shared constants (valid statuses, phases, themes, milestone templates, field limits)
- `middleware/auth.js` — `requireAuth` (JWT) and `requireAdmin` middleware
- `middleware/validate.js` — `validateProjectInput()`, `validateEvaluationInput()`
- `middleware/error-handler.js` — `asyncHandler()` wrapper, centralized `errorHandler()`
- `routes/auth.js` — Register, login, /me, theme, password
- `routes/admin.js` — User management (admin-only)
- `routes/projects/` — Split into crud.js, evaluations.js, documents.js, milestones.js, changelog.js with shared helpers.js

### Frontend (`public/`)

No build tools — globals loaded via `<script>` tags in `index.html`. Load order matters.

- `js/constants.js` — Shared frontend constants (DEFAULT_EVALUATION, MANDATORY_DOCS, toast durations)
- `js/api-client.js` — REST client with local cache. `Store = ApiClient` alias for backward compat
- `js/themes.js` — Theme system with CSS variable injection
- `js/auth.js` — Login/register UI
- `js/views/` — 10 view modules (dashboard, projects, project-detail, clause, requirement, documents, timeline, reports, settings, admin)
- `js/views.js` — Thin facade delegating to view modules. Contains changelog helpers (`_fieldLabel`, `_formatChangeValue`, `_renderChangelogEntries`)
- `js/md-export.js` — Markdown export (`GuideExport`). No PDF export.
- `js/app.js` — Main SPA controller, navigation, utility methods
- `data/iso9001.js` — ISO 9001:2015 requirements data (`CERTIFICATIONS`, `flattenRequirements`, `countRequirements`)

### Key patterns

- Frontend uses global objects (not ES modules). ESLint globals are declared in `.eslintrc.json` overrides for `public/**/*.js`
- Views follow `render()` + `bind()` pattern — render returns HTML string, bind attaches event listeners
- All API calls go through `ApiClient._fetch()` which auto-handles auth headers and 401/403 logout
- Test files use ESM imports (`import from 'vitest'`) with `createRequire` for CJS server modules

## Environment variables

- `JWT_SECRET` (required) — JWT signing key
- `DB_PATH` — SQLite file path (default: `data/db.sqlite`, use `:memory:` for tests)
- `PORT` — Server port (default: 3000)
