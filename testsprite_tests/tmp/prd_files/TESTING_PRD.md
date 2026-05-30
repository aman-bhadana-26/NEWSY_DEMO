# NEWSY TECH — Frontend & Backend Testing PRD

**Product:** NEWSY TECH (full-stack tech news platform)  
**Document type:** Product Requirements Document — Testing  
**Version:** 1.0  
**Last updated:** May 2026  
**Status:** Draft — no automated test suite in repo today

---

## 1. Executive summary

NEWSY TECH is a Next.js 14 frontend and Express/MongoDB backend with JWT auth, news aggregation, saved articles, comments, reactions, analytics, and an admin dashboard. Testing today is **manual only** (see `frontend/README.md`, `API_DOCUMENTATION.md` cURL examples, `PROJECT_SUMMARY.md`).

This PRD defines **what** to test, **how** (layers and tools), **acceptance criteria**, and a **phased rollout** so the team can add automated coverage without blocking feature work.

### Goals

| Goal | Success metric |
|------|----------------|
| Prevent regressions on auth and protected APIs | ≥90% of critical API paths covered by integration tests |
| Stable UI for core user journeys | E2E passes for guest + logged-in flows on CI |
| Faster, safer refactors | Unit tests on pure utils/controllers with &lt;5 min CI test job |
| Documented manual QA | Repeatable checklist per release |

### Non-goals (v1)

- Load/performance testing at scale (defer to Phase 3)
- Visual regression on WebGL/particle effects (Aurora, Three.js) beyond smoke “page loads”
- Penetration testing / formal security audit (separate security PRD)

---

## 2. System under test

### 2.1 Architecture

```
Browser (Next.js :3000)
    → axios + AuthContext (localStorage JWT)
    → Express API (:5000/api)
        → MongoDB (users, saved, comments, reactions, analytics)
        → NewsAPI.org (external, rate-limited)
```

### 2.2 Backend surface (`backend/server.js`)

| Prefix | Purpose |
|--------|---------|
| `/api/health` | Liveness |
| `/api/auth` | Register, login, profile, profile picture |
| `/api/news` | News, headlines, trending, article content |
| `/api/my-news` | Preferences, save/unsave, saved list |
| `/api/saved` | Legacy/alternate saved articles CRUD |
| `/api/comments` | CRUD by article |
| `/api/reactions` | Get/toggle per article |
| `/api/analytics` | Reading track, user/site stats |
| `/api/admin` | Stats, user management (admin-only) |

**Stack:** Node.js, Express 4, Mongoose 8, JWT, bcrypt, multer, express-validator.

### 2.3 Frontend surface

| Area | Paths / modules |
|------|-----------------|
| Pages | `/`, `/home`, `/login`, `/signup`, `/profile`, `/my-news`, `/trending`, `/article/[slug]`, `/analytics`, `/admin`, `/admin/users`, static (`/about`, `/contact`) |
| Context | `AuthContext`, `LanguageContext` |
| API client | `frontend/utils/api.js` |
| Utils | `formatDate.js`, `timeAgo.js`, `translations.js` |
| Components | Navbar, news cards, comments, reactions, category filters, admin widgets |

**Stack:** Next.js 14 (Pages Router), React 18, CSS Modules, Tailwind, axios.

### 2.4 Current state

- **No** `test` scripts in `frontend/package.json` or `backend/package.json`
- **No** Jest/Vitest/Playwright/Cypress config in repo
- TestSprite config exists at `testsprite_tests/tmp/config.json` (exploratory; not CI)
- Manual checklists exist in docs only

---

## 3. Test strategy (pyramid)

```
        ┌─────────────┐
        │  E2E (few)  │  Playwright — critical journeys
        ├─────────────┤
        │ Integration │  Supertest + test DB — all API routes
        ├─────────────┤
        │  Unit (many)│  Jest — utils, middleware, controllers (mocked)
        └─────────────┘
```

| Layer | Backend tool | Frontend tool |
|-------|--------------|---------------|
| Unit | Jest | Jest + React Testing Library |
| Integration | Jest + Supertest + mongodb-memory-server (or test Mongo URI) | MSW or mocked `api.js` for page/component tests |
| E2E | N/A (API exercised via UI) | Playwright |
| Contract (optional) | OpenAPI or shared fixtures vs `API_DOCUMENTATION.md` | Same |

**Coverage targets (Phase 2 complete):**

- Backend: **80%** line coverage on `controllers/`, `middleware/`, `utils/`
- Frontend: **70%** on `utils/`, hooks; **smoke coverage** on top 10 components
- E2E: **8–12** stable scenarios (see §6)

---

## 4. Environments & test data

### 4.1 Environments

| Env | Frontend | Backend | Database | External APIs |
|-----|----------|---------|----------|---------------|
| Local dev | `localhost:3000` | `localhost:5000` | Dev MongoDB | Real NewsAPI (limited) |
| CI | `next start` or dev | `NODE_ENV=test` | `mongodb-memory-server` or ephemeral Mongo service | **Mocked** News responses |
| Staging | Deploy URL | Deploy URL | Staging DB | NewsAPI dev key |

### 4.2 Environment variables (test)

```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret-min-32-chars
MONGO_URI=mongodb://127.0.0.1:27017/newsy_test
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4.3 Fixtures & seeds

| Fixture | Description |
|---------|-------------|
| `user_guest` | No token |
| `user_standard` | Registered non-admin |
| `user_admin` | `isAdmin: true` |
| `article_fixture` | Stable title/url/slug for comments/reactions |
| `news_mock_payload` | Static JSON matching `newsController` shape when NewsAPI is stubbed |

**Rules:**

- Use unique emails per test run (`test+{uuid}@newsy.test`)
- Clean collections between integration tests (`beforeEach` drop or transaction)
- Never commit real API keys; use `.env.test.example`

---

## 5. Backend testing requirements

### 5.1 Tooling (to implement)

```json
// backend/package.json (target)
"scripts": {
  "test": "jest --runInBand",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

**Dependencies (dev):** `jest`, `supertest`, `mongodb-memory-server` (or `@shelf/jest-mongodb`), optional `nock` for HTTP mocks to NewsAPI.

### 5.2 Unit tests

| Module | Cases |
|--------|--------|
| `utils/generateToken.js` | Token includes user id; expires per config |
| `utils/detectTopic.js` | Keyword → topic mapping; streak/date helpers |
| `middleware/auth.js` | Missing token → 401; invalid token → 401; valid → `req.user` |
| `middleware/admin.js` | Non-admin → 403; admin passes |
| `middleware/upload.js` | Reject invalid MIME/size (if validated) |
| `models/User.js` | Password hashed on save; comparePassword |
| Controllers (mocked `req/res`) | Validation branches, error messages |

### 5.3 Integration tests (API)

Each group runs against an in-memory app instance (`server.js` exported as `app` without `listen` for Supertest).

#### 5.3.1 Health & errors

| ID | Endpoint | Method | Expect |
|----|----------|--------|--------|
| B-H01 | `/api/health` | GET | 200, `status: OK` |
| B-H02 | `/api/unknown` | GET | 404, `Route not found` |

#### 5.3.2 Auth (`/api/auth`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-A01 | Register valid user | 201, `_id`, `token` |
| B-A02 | Register duplicate email | 400 |
| B-A03 | Register invalid email / short password | 400 |
| B-A04 | Login valid | 200, token |
| B-A05 | Login wrong password | 401 |
| B-A06 | GET profile without token | 401 |
| B-A07 | GET profile with token | 200, user fields |
| B-A08 | PUT profile update name | 200, updated name |
| B-A09 | POST profile picture (multipart) | 200, URL or path |
| B-A10 | DELETE profile picture | 200 |

#### 5.3.3 News (`/api/news`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-N01 | GET `/` default pagination | 200, `success`, `articles` array |
| B-N02 | GET `?category=ai` | 200, filtered or mock-consistent |
| B-N03 | GET `/headlines` | 200, structure |
| B-N04 | GET `/trending` | 200, structure |
| B-N05 | POST `/article-content` valid body | 200 or documented error when upstream fails |
| B-N06 | NewsAPI failure (mocked) | 500, `success: false` |

#### 5.3.4 My News (`/api/my-news`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-M01 | GET `/` without auth | 401 |
| B-M02 | GET/PUT `/preferences` | 200, persisted preferences |
| B-M03 | POST `/save` article | 201/200 |
| B-M04 | DELETE `/save/:articleUrl` | 200 |
| B-M05 | GET `/saved` | 200, list includes saved item |

#### 5.3.5 Saved articles (`/api/saved`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-S01 | POST save (auth) | 201 |
| B-S02 | POST duplicate | 400 |
| B-S03 | GET list | 200 |
| B-S04 | DELETE `/:id` | 200; 404 unknown id |

#### 5.3.6 Comments (`/api/comments`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-C01 | GET by `articleUrl` query | 200, array |
| B-C02 | POST without auth | 401 |
| B-C03 | POST valid comment | 201 |
| B-C04 | PUT own comment | 200 |
| B-C05 | PUT other user's comment | 403/404 |
| B-C06 | DELETE own comment | 200 |

#### 5.3.7 Reactions (`/api/reactions`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-R01 | GET counts (guest) | 200 |
| B-R02 | POST toggle like (auth) | 200, state changes |
| B-R03 | POST toggle again | removes or toggles per spec |

#### 5.3.8 Analytics (`/api/analytics`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-AN01 | POST `/track` (auth) | 201/200 |
| B-AN02 | GET `/me` | 200, user stats shape |
| B-AN03 | GET `/site` non-admin | 403 |
| B-AN04 | GET `/site` admin | 200 |

#### 5.3.9 Admin (`/api/admin`)

| ID | Scenario | Expect |
|----|----------|--------|
| B-AD01 | GET `/stats` non-admin | 403 |
| B-AD02 | GET `/stats` admin | 200 |
| B-AD03 | GET `/users` paginated/filtered | 200 |
| B-AD04 | PUT user status | 200 |
| B-AD05 | DELETE user | 200; cannot delete self (if rule exists) |
| B-AD06 | POST bulk-action | 200, expected side effects |

### 5.4 Security & negative tests

- JWT tampering → 401
- Expired token (mock clock) → 401
- IDOR: user A cannot delete user B’s saved article / comment
- No stack traces in production error body (`NODE_ENV=production` mock)
- CORS: preflight from allowed `FRONTEND_URL` succeeds

### 5.5 Backend acceptance criteria

- [ ] `npm test` in `backend/` exits 0 on CI
- [ ] All IDs in §5.3 implemented or explicitly skipped with ticket
- [ ] NewsAPI never called in CI (mocked)
- [ ] Coverage report uploaded or threshold enforced (≥80% controllers)

---

## 6. Frontend testing requirements

### 6.1 Tooling (to implement)

```json
// frontend/package.json (target)
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:e2e": "playwright test"
}
```

**Dependencies (dev):** `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw` (optional), `@playwright/test`.

**Config notes:**

- `jest.config.js`: `testPathIgnorePatterns: ['<rootDir>/.next/']`, moduleNameMapper for CSS modules
- Playwright: `baseURL: http://localhost:3000`, start servers via `webServer` in config

### 6.2 Unit & utility tests

| Module | Cases |
|--------|--------|
| `utils/formatDate.js` | Invalid/null input; relative vs full format |
| `utils/timeAgo.js` | Minutes/hours/days boundaries |
| `utils/translations.js` | Key exists for `en` + secondary locale; missing key fallback |
| `lib/utils.js` | `cn()` / class merge behavior |
| `pages/trending.js` topic helpers | Regex classification samples (extract pure functions if needed) |

### 6.3 Component tests (RTL)

Priority components (render + interaction):

| Component | Cases |
|-----------|--------|
| `Navbar` | Logged out shows Login; logged in shows Profile/Logout |
| `NewsCard` | Title, link, image fallback |
| `CategoryFilter` | Click category → callback/active state |
| `ArticleComments` | List render; submit disabled when empty |
| `ArticleReactions` | Display counts; click triggers API mock |
| `LanguageSwitcher` | Changes locale context |
| `LoadingSpinner` / `Skeleton` | Renders without crash |
| `TopTrending` | Empty state vs populated list |

**Patterns:**

- Wrap with `AuthProvider` / `LanguageProvider` test helpers
- Mock `frontend/utils/api.js` — do not hit real backend in unit tests

### 6.4 Page-level tests (integration, mocked API)

| Page | Cases |
|------|--------|
| `login.js` | Validation errors; successful login stores token (mock) |
| `signup.js` | Password rules; redirect on success |
| `profile.js` | Loads profile; update form submission |
| `home.js` | Renders news grid from mock response |
| `article/[slug].js` | Article detail, comments/reactions sections |
| `admin/index.js` | Redirect or deny non-admin |

### 6.5 E2E tests (Playwright)

Run against local stack with **seeded backend** or dedicated test DB.

| ID | Journey | Steps | Assert |
|----|---------|-------|--------|
| F-E01 | Guest homepage | Visit `/` or `/home` | Headlines visible; no console errors |
| F-E02 | Category filter | Select category | List updates or URL/query reflects filter |
| F-E03 | Sign up | `/signup` → submit | Lands on authenticated area; token in storage |
| F-E04 | Login / logout | `/login` → logout | Session cleared; guest nav |
| F-E05 | Article read | Open article card | Detail page; external/source link present |
| F-E06 | Save article | Login → save from card | Appears on `/my-news` |
| F-E07 | Comment | Login → post comment | Comment visible after refresh |
| F-E08 | Reaction | Login → toggle like | Count updates |
| F-E09 | Profile update | Change name | Persists after reload |
| F-E10 | Trending page | Visit `/trending` | Content loads |
| F-E11 | i18n | Switch language | UI strings change (sample keys) |
| F-E12 | Admin | Admin login → `/admin` | Dashboard stats; non-admin blocked |

### 6.6 Responsive & accessibility (manual + selective auto)

| Check | Breakpoints | Tool |
|-------|-------------|------|
| Layout | 375px, 768px, 1280px | Manual + Playwright viewport |
| Keyboard nav | Login form, main nav | axe-playwright (optional) |
| Focus visible | Interactive controls | Manual |
| Reduced motion | Respect `prefers-reduced-motion` for animations | Manual |

### 6.7 Frontend acceptance criteria

- [ ] `npm test` in `frontend/` exits 0 on CI
- [ ] E2E suite ≤ 10 minutes with parallel workers
- [ ] No flake &gt;2% over 10 CI runs (quarantine flaky tests)
- [ ] `next build` succeeds in CI before E2E

---

## 7. Manual QA checklist (release gate)

Use when automated suite is incomplete or before production deploy.

### 7.1 Smoke (15 min)

- [ ] `GET /api/health` OK
- [ ] Homepage loads news
- [ ] Login / signup / logout
- [ ] One article opens end-to-end
- [ ] Mobile menu opens/closes

### 7.2 Full regression (45–60 min)

**Auth & profile**

- [ ] Register, login, wrong password message
- [ ] Profile view/edit; profile picture upload/remove

**News & navigation**

- [ ] All main categories filter correctly
- [ ] Trending and top stories sections
- [ ] Search/filter if applicable
- [ ] Language switcher (all supported locales)

**Social features**

- [ ] Save / unsave article
- [ ] Comment create, edit, delete
- [ ] Reaction toggle

**My News & analytics**

- [ ] Preferences persist
- [ ] Analytics page loads for logged-in user

**Admin**

- [ ] Admin login only
- [ ] User list, status change, bulk action
- [ ] Site analytics (admin)

**Cross-browser**

- [ ] Chrome, Firefox, Safari (or Edge + one WebKit)

**Responsive**

- [ ] Phone, tablet, desktop layouts

---

## 8. CI/CD integration

### 8.1 Pipeline stages

```yaml
# Conceptual GitHub Actions workflow
jobs:
  backend-test:
    - npm ci (backend)
    - npm test -- --coverage
  frontend-unit:
    - npm ci (frontend)
    - npm test -- --coverage
  frontend-build:
    - npm run build
  e2e:
    needs: [backend-test, frontend-build]
    - start Mongo + seed
    - start backend (PORT=5000)
    - start frontend (PORT=3000)
    - npx playwright test
```

### 8.2 Policies

| Policy | Rule |
|--------|------|
| PR merge | Unit + integration required green |
| Main branch | E2E required green |
| Coverage | No decrease &gt;2% on touched packages without approval |
| Secrets | CI uses repository secrets for `JWT_SECRET`, test `MONGO_URI` only |

### 8.3 Reporting

- JUnit XML from Jest and Playwright → CI annotations
- Optional: Codecov or Coveralls for backend + frontend coverage badges in `README.md`

---

## 9. Implementation phases

| Phase | Duration (est.) | Deliverables |
|-------|-----------------|--------------|
| **0 — Foundation** | 1 week | Jest in backend + frontend; health + auth integration tests; CI job |
| **1 — API complete** | 2 weeks | All §5.3 route groups; NewsAPI mock; mongodb-memory-server |
| **2 — Frontend unit** | 2 weeks | Utils + 8 priority components; MSW for `api.js` |
| **3 — E2E** | 1–2 weeks | Playwright F-E01–F-E12; seeded data script |
| **4 — Hardening** | Ongoing | Coverage gates, axe, flake fixes, contract tests |

---

## 10. Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NewsAPI rate limits in dev/CI | Flaky E2E | Stub `newsController` HTTP layer in test |
| WebGL / Three.js in JSDOM | Component tests fail | Mock dynamic imports; E2E smoke only |
| JWT in localStorage | E2E auth complexity | Playwright `storageState` fixture after login |
| Duplicate saved routes (`/api/saved` vs `/api/my-news`) | Confusion | Test both until consolidated; document canonical API |
| Test DB pollution | Flaky tests | Isolate DB per job; `beforeEach` cleanup |

---

## 11. Roles & ownership

| Role | Responsibility |
|------|----------------|
| Engineering | Implement tests per phase; keep fixtures updated |
| QA / PM | Own manual checklist §7; sign off release |
| DevOps | CI secrets, Mongo service, Playwright browsers cache |

---

## 12. Definition of done (testing initiative)

The testing initiative is **done** when:

1. Backend and frontend have `npm test` with documented setup in `README.md`
2. CI runs unit + integration on every PR
3. E2E covers F-E01–F-E08 minimum on `main`
4. Manual checklist §7.1 is required for production releases
5. This PRD is reviewed and version bumped when new routes/pages ship

---

## 13. References

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — endpoint contracts
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — feature list and manual strategy
- [frontend/README.md](./frontend/README.md) — frontend manual checklist
- [backend/README.md](./backend/README.md) — backend setup
- [QUICK_START.md](./QUICK_START.md) — run locally for E2E

---

## Appendix A — Suggested file layout

```
newsy_demo/
├── TESTING_PRD.md                 # this document
├── backend/
│   ├── jest.config.js
│   ├── __tests__/
│   │   ├── integration/
│   │   │   ├── auth.test.js
│   │   │   ├── news.test.js
│   │   │   └── ...
│   │   ├── unit/
│   │   └── helpers/
│   │       ├── setup.js
│   │       └── fixtures.js
│   └── server.js                  # export app for Supertest
├── frontend/
│   ├── jest.config.js
│   ├── __tests__/
│   │   ├── utils/
│   │   └── components/
│   └── e2e/
│       ├── playwright.config.ts
│       └── specs/
└── .github/workflows/test.yml
```

## Appendix B — Traceability matrix (sample)

| Feature | Backend IDs | Frontend IDs | E2E |
|---------|-------------|--------------|-----|
| Auth | B-A01–B-A10 | login/signup pages | F-E03, F-E04 |
| News feed | B-N01–B-N06 | home, CategoryFilter | F-E01, F-E02 |
| Saved articles | B-S01–B-S04, B-M03–B-M05 | MyNewsCard | F-E06 |
| Comments | B-C01–B-C06 | ArticleComments | F-E07 |
| Reactions | B-R01–B-R03 | ArticleReactions | F-E08 |
| Admin | B-AD01–B-AD06 | admin pages | F-E12 |

---

*End of document*
