import requests
import uuid

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_get_api_auth_profile_requires_authentication():
    # Helper user credentials
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    register_payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "TestPassword123!"
    }

    user_id = None
    token = None

    try:
        # 1. Register a new user to obtain JWT token
        register_resp = requests.post(
            f"{BASE_URL}/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        assert register_resp.status_code == 201, f"Expected 201 on register, got {register_resp.status_code}"
        register_data = register_resp.json()
        user_id = register_data.get("_id")
        token = register_data.get("token")
        assert token, "Token not found in register response"

        # 2. Access /auth/profile with valid token - expect 200 and user profile data
        headers = {"Authorization": f"Bearer {token}"}
        profile_resp = requests.get(
            f"{BASE_URL}/auth/profile",
            headers=headers,
            timeout=TIMEOUT
        )
        assert profile_resp.status_code == 200, f"Expected 200 on profile with token, got {profile_resp.status_code}"
        profile_data = profile_resp.json()
        assert "_id" in profile_data and profile_data["_id"] == user_id, "User _id mismatch"
        assert "name" in profile_data and profile_data["name"] == register_payload["name"], "User name mismatch"
        assert "email" in profile_data and profile_data["email"] == register_payload["email"], "User email mismatch"
        assert "createdAt" in profile_data, "createdAt field missing in profile response"

        # 3. Access /auth/profile without token - expect 401 unauthorized
        no_auth_resp = requests.get(
            f"{BASE_URL}/auth/profile",
            timeout=TIMEOUT
        )
        assert no_auth_resp.status_code == 401, f"Expected 401 on profile without token, got {no_auth_resp.status_code}"
        no_auth_data = no_auth_resp.json()
        assert "message" in no_auth_data, "Error message missing in 401 response"

    finally:
        # Cleanup: There is no explicit delete user endpoint in PRD, so skipping deletion.
        # If deleting test users is possible in real environment, do it here.
        pass

test_get_api_auth_profile_requires_authentication()