# TestSprite Backend Test Report — NEWSY DEMO

---

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| **Project** | newsy_demo |
| **Test type** | Backend API |
| **Date** | 2026-05-23 |
| **Endpoint base** | http://localhost:5000/api |
| **Environment** | Development (nodemon) |
| **Prepared by** | TestSprite MCP + Cursor Agent |
| **Test plan** | `testsprite_tests/testsprite_backend_test_plan.json` |
| **Dashboard** | [TestSprite run](https://www.testsprite.com/dashboard/mcp/tests/3088677e-2392-46d9-ac50-106d8d7ad030) |

---

## 2️⃣ Requirement Validation Summary

### Requirement: Health Check

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC001 | `get_api_health_returns_status_ok` | ✅ Passed | `GET /api/health` returns OK status |

### Requirement: Authentication

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC002 | `post_api_auth_register_creates_new_user` | ✅ Passed | Register returns 201 with token |
| TC003 | `post_api_auth_login_authenticates_user` | ✅ Passed | Login returns 200 with token |
| TC004 | `get_api_auth_profile_requires_authentication` | ✅ Passed | Profile requires JWT; 401 without token |
| TC005 | `put_api_auth_profile_updates_user_data` | ✅ Passed | Profile update succeeds |
| TC006 | `post_api_auth_profile_picture_uploads_image` | ❌ Failed | Expected 200, received **500** on multipart upload |
| TC007 | `delete_api_auth_profile_picture_removes_image` | ✅ Passed | Delete picture endpoint works |

### Requirement: News Feed

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC008 | `get_api_news_returns_paginated_articles` | ✅ Passed | Paginated news list returns expected shape |
| TC009 | `post_api_news_article_content_extracts_content` | ❌ Failed | Response JSON missing expected `content` key (schema mismatch) |

### Requirement: My News / Preferences

| Test ID | Title | Status | Notes |
|---------|-------|--------|-------|
| TC010 | `get_api_my_news_preferences_returns_user_topics` | ❌ Failed | Login step returned **401** — test fixture credentials or token handling issue |

---

## 3️⃣ Coverage & Matching Metrics

| Metric | Value |
|--------|-------|
| **Total tests executed** | 10 |
| **Passed** | 7 |
| **Failed** | 3 |
| **Pass rate** | **70%** |

| Requirement | Total | ✅ Passed | ❌ Failed |
|-------------|-------|-----------|-----------|
| Health Check | 1 | 1 | 0 |
| Authentication | 6 | 5 | 1 |
| News Feed | 2 | 1 | 1 |
| My News | 1 | 0 | 1 |

**Generated test files:** `testsprite_tests/TC001_*.py` through `TC010_*.py`

---

## 4️⃣ Key Gaps / Risks

1. **Profile picture upload (TC006)** — Multipart `POST /api/auth/profile/picture` returns 500. Likely multer path, file validation, or storage error; check server logs and `authController.uploadProfilePicture`.
2. **Article content extraction (TC009)** — API response shape does not match test expectation (`content` key). Align controller response with API docs or update test assertion to match actual field names (e.g. `text`, `body`).
3. **My News preferences auth (TC010)** — Test failed at login (401). May use stale credentials from prior tests or wrong email; ensure isolated test user per run.
4. **Coverage gap** — Plan did not include comments, reactions, analytics, admin, or saved-articles routes; expand test plan in a follow-up run.
5. **External dependency** — News endpoints depend on NewsAPI; rate limits can cause intermittent failures outside these 10 cases.

### Recommended fixes (priority)

| Priority | Item | Action |
|----------|------|--------|
| P1 | TC006 | Debug 500 on profile picture upload; verify `uploads/profiles` directory permissions |
| P2 | TC009 | Document actual JSON shape from `getArticleContent`; fix controller or test |
| P3 | TC010 | Use unique test user registration in test setup before preferences call |

---

*Report generated after TestSprite `generateCodeAndExecute` backend run.*
