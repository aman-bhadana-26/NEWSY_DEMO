# TestSprite Frontend Test Report — NEWSY DEMO

---

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| **Project** | newsy_demo |
| **Test type** | Frontend (Playwright E2E via TestSprite) |
| **Date** | 2026-05-23 |
| **Frontend URL** | http://localhost:3000 |
| **Backend URL** | http://localhost:5000/api |
| **Server mode** | Development (`npm run dev`) |
| **Prepared by** | TestSprite MCP + Cursor Agent |
| **Test plan** | `testsprite_tests/testsprite_frontend_test_plan.json` |
| **Dashboard** | [TestSprite frontend run](https://www.testsprite.com/dashboard/mcp/tests/f3296548-f1ca-45da-a0d0-52786c5d3fee) |

---

## 2️⃣ Requirement Validation Summary

### Requirement: API / Infrastructure

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC001 | Verify the API health check responds successfully | ✅ Passed | Health endpoint reachable via browser |

### Requirement: Auth — Guest Protection

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC002 | Block access to personalized news without signing in | ⛔ BLOCKED | `/my-news` rendered blank; SPA not loaded |

### Requirement: Auth — Registration & Profile

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC003 | Register and access the authenticated profile | ⛔ BLOCKED | GET on register route (wrong method); blank SPA early |
| TC004 | Log in and update profile details | ⛔ BLOCKED | GET on login route; SPA unstable |
| TC005 | Set preferences and save article from personalized feed | ✅ Passed | Partial flow via login/signup UI |
| TC012 | View and update topic preferences | ✅ Passed | Login UI + profile navigation worked |

### Requirement: News Browsing (Guest)

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC006 | Browse tech news successfully | ❌ Failed | API returns articles; **UI blank** under load |
| TC011 | View top headlines successfully | ⛔ BLOCKED | Headlines API OK; **frontend SPA did not render** |
| TC014 | View trending tech stories successfully | ❌ Failed | UI blank; **trending API returned empty `articles[]`** |

### Requirement: Personalized News (Authenticated)

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC007 | Load personalized news after login | ⛔ BLOCKED | Runtime error: `Cannot read properties of null (reading 'parentNode')` in `globals.css` |
| TC009 | Save an article to personal collection | ✅ Passed | Navigation/login flow completed (agent-verified) |

### Requirement: Saved Articles

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC015 | Remove a saved article | ⛔ BLOCKED | Signup returns **Server error** banner |

### Requirement: Admin

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC008 | Access admin dashboard and review site analytics | ⛔ BLOCKED | `example@gmail.com` / `password123` invalid |
| TC010 | Block non-admin access to admin dashboard | ⛔ BLOCKED | Login page blank (0 interactive elements) |
| TC013 | View site analytics as an admin | ⛔ BLOCKED | Same credential failure |

---

## 3️⃣ Coverage & Matching Metrics

| Metric | Value |
|--------|-------|
| **Total tests** | 15 |
| **Passed** | 4 |
| **Failed** | 2 |
| **Blocked** | 9 |
| **Pass rate (strict)** | **26.7%** |
| **Pass rate (excluding blocked)** | 4 / 6 actionable ≈ **66.7%** |

| Requirement | Total | ✅ Passed | ❌ Failed | ⛔ Blocked |
|-------------|-------|-----------|-----------|------------|
| API / Infrastructure | 1 | 1 | 0 | 0 |
| Auth — Guest protection | 1 | 0 | 0 | 1 |
| Auth — Registration & profile | 4 | 2 | 0 | 2 |
| News browsing (guest) | 3 | 0 | 2 | 1 |
| Personalized news | 2 | 1 | 0 | 1 |
| Saved articles | 1 | 0 | 0 | 1 |
| Admin | 3 | 0 | 0 | 3 |

**Artifacts:** `testsprite_tests/TC001_*.py` … `TC015_*.py`, videos on TestSprite dashboard per test.

---

## 4️⃣ Key Gaps / Risks

1. **Dev server overload** — TestSprite warned that `npm run dev` is single-threaded. Concurrent Playwright runs caused port timeouts and blank pages. **Re-run with `npm run build && npm run start`** for stable E2E.
2. **Intermittent SPA failure** — Many tests saw 0 interactive elements or white screens; not necessarily permanent app bugs but **test environment instability**.
3. **Client runtime error (TC007)** — `TypeError: Cannot read properties of null (reading 'parentNode')` in style injection; investigate `frontend/styles/globals.css` and Next.js CSS pipeline under stress.
4. **Signup server errors (TC015)** — Registration showed “Server error” during test run; check backend logs and MongoDB connectivity under parallel signups.
5. **Missing test credentials** — Admin tests used placeholder `example@gmail.com` / `password123`. Provide seeded admin user in TestSprite instructions or `.env.test`.
6. **Trending API empty array (TC014)** — `/api/news/trending` returned `articles: []` for date range; product bug or NewsAPI filter issue.
7. **False negatives on API method** — TC003/TC004 used GET on POST-only auth routes; tests reported “Route not found” incorrectly.

### Recommended next steps

| Priority | Action |
|----------|--------|
| P1 | Re-run frontend tests in **production mode** with both servers idle |
| P2 | Add TestSprite `additionalInstruction` with valid test user + admin emails |
| P3 | Fix trending endpoint when `articles` is empty |
| P4 | Investigate signup 500 under load and profile-picture upload (see backend report) |

---

*Report generated after TestSprite `generateCodeAndExecute` frontend run.*
