import requests
import uuid

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30


def put_api_auth_profile_updates_user_data():
    # First, register a new user to obtain valid token and user data
    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    profile_update_url = f"{BASE_URL}/auth/profile"
    user_unique_suffix = str(uuid.uuid4())[:8]
    user_name = f"Test User {user_unique_suffix}"
    user_email = f"testuser_{user_unique_suffix}@example.com"
    user_password = "TestPass123!"

    register_payload = {
        "name": user_name,
        "email": user_email,
        "password": user_password
    }

    user_id = None
    token = None

    try:
        # Register user
        reg_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 201, f"Registration failed with status {reg_resp.status_code}"
        reg_data = reg_resp.json()
        assert "_id" in reg_data and "name" in reg_data and "email" in reg_data and "token" in reg_data
        user_id = reg_data["_id"]
        token = reg_data["token"]

        # Prepare updated profile data
        updated_name = user_name + " Updated"
        updated_email = f"updated_{user_email}"
        update_payload = {
            "name": updated_name,
            "email": updated_email
        }
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Update profile
        put_resp = requests.put(profile_update_url, json=update_payload, headers=headers, timeout=TIMEOUT)
        assert put_resp.status_code == 200, f"Profile update failed with status {put_resp.status_code}"
        put_data = put_resp.json()
        assert "_id" in put_data and "name" in put_data and "email" in put_data and "token" in put_data
        assert put_data["_id"] == user_id
        assert put_data["name"] == updated_name
        assert put_data["email"] == updated_email
        assert isinstance(put_data["token"], str) and len(put_data["token"]) > 0

    finally:
        # Clean up: if needed, delete the user (if API supported user deletion)
        # API does not specify user deletion endpoint; skipping cleanup.
        # Alternatively, no action here assuming test db reset or isolation.
        pass


put_api_auth_profile_updates_user_data()