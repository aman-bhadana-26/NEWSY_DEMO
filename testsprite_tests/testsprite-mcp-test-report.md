# TestSprite Combined Test Report — NEWSY DEMO

---

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| **Project** | newsy_demo |
| **Date** | 2026-05-23 |
| **Tool** | TestSprite MCP |
| **Stacks tested** | Express API (port 5000) + Next.js UI (port 3000) |
| **PRD reference** | `TESTING_PRD.md`, `testsprite_tests/tmp/prd_files/TESTING_PRD.md` |
| **Detailed reports** | [Backend](./testsprite_backend_test_report.md) · [Frontend](./testsprite_frontend_test_report.md) |

| Run | Dashboard |
|-----|-----------|
| Backend API | [View run](https://www.testsprite.com/dashboard/mcp/tests/3088677e-2392-46d9-ac50-106d8d7ad030) |
| Frontend E2E | [View run](https://www.testsprite.com/dashboard/mcp/tests/f3296548-f1ca-45da-a0d0-52786c5d3fee) |

---

## 2️⃣ Requirement Validation Summary

### Backend API tests (10 cases)

| Result | Count | Tests |
|--------|-------|-------|
| ✅ Passed | 7 | TC001–TC005, TC007–TC008 |
| ❌ Failed | 3 | TC006 (profile picture 500), TC009 (content key mismatch), TC010 (preferences login 401) |

See [backend report](./testsprite_backend_test_report.md) for per-endpoint analysis.

### Frontend E2E tests (15 cases)

| Result | Count | Tests |
|--------|-------|-------|
| ✅ Passed | 4 | TC001, TC005, TC009, TC012 |
| ❌ Failed | 2 | TC006, TC014 |
| ⛔ Blocked | 9 | TC002–TC004, TC007–TC008, TC010–TC011, TC013, TC015 |

See [frontend report](./testsprite_frontend_test_report.md) for UI/runtime notes.

---

## 3️⃣ Coverage & Matching Metrics

| Suite | Tests | Passed | Failed | Blocked | Pass rate |
|-------|-------|--------|--------|---------|-----------|
| **Backend** | 10 | 7 | 3 | 0 | **70%** |
| **Frontend** | 15 | 4 | 2 | 9 | **26.7%** |
| **Combined** | 25 | 11 | 5 | 9 | **44%** (passed / total) |

**Generated scripts:** 25 Python test files under `testsprite_tests/`

---

## 4️⃣ Key Gaps / Risks

### Cross-cutting

- **Environment:** Frontend run used dev servers under heavy parallel load; many BLOCKED results are environmental, not confirmed product defects.
- **Credentials:** No seeded test/admin users for TestSprite; blocks admin and some auth flows.
- **Coverage:** Comments, reactions, and full admin CRUD not in either test plan yet.

### Backend (fix first)

1. Profile picture upload returns 500 (`POST /api/auth/profile/picture`).
2. Article content response schema does not expose `content` as tests expect.
3. My-news preferences test needs isolated user registration in setup.

### Frontend (fix / re-test)

1. Re-run E2E after `npm run build && npm run start` on frontend (and stable backend).
2. Investigate CSS/runtime error on login (`parentNode` null).
3. Signup “Server error” during concurrent registration attempts.
4. Trending API returning empty `articles` array.
5. Provide valid admin credentials in TestSprite instructions for TC008/TC013.

---

*Combined summary. Re-run TestSprite after production build + test user seed for more reliable frontend scores.*
