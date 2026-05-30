import requests
import uuid

BASE_URL = "http://localhost:5000/api"
REGISTER_ENDPOINT = f"{BASE_URL}/auth/register"

def post_api_auth_register_creates_new_user():
    # Generate a unique email to avoid duplicate conflicts
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "StrongP@ssw0rd!"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(REGISTER_ENDPOINT, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected status code 201 but got {response.status_code}"

        data = response.json()
        # Validate presence and types of required fields
        assert "_id" in data and isinstance(data["_id"], str) and data["_id"], "Missing or invalid '_id'"
        assert "name" in data and data["name"] == payload["name"], "Returned name does not match"
        assert "email" in data and data["email"] == payload["email"], "Returned email does not match"
        assert "token" in data and isinstance(data["token"], str) and data["token"], "Missing or invalid token"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

post_api_auth_register_creates_new_user()