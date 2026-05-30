import requests

BASE_URL = "http://localhost:5000/api"

def test_post_api_auth_login_authenticates_user():
    url = f"{BASE_URL}/auth/login"
    # Use known valid credentials for testing. If none provided, create user first.
    test_email = "testuser_login@example.com"
    test_password = "TestPassword123!"
    test_name = "Test User Login"

    # First, attempt to register user to ensure test email exists.
    register_url = f"{BASE_URL}/auth/register"
    register_payload = {
        "name": test_name,
        "email": test_email,
        "password": test_password
    }
    try:
        register_resp = requests.post(register_url, json=register_payload, timeout=30)
        # It's okay if user already exists (400 error with message), just proceed to login.
    except requests.RequestException as e:
        assert False, f"Registration request failed: {e}"

    # Now, attempt login with the valid credentials
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    try:
        response = requests.post(url, json=login_payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, dict), "Response JSON is not a dictionary"
    for key in ["_id", "name", "email", "token"]:
        assert key in data, f"Response JSON missing '{key}' key"
    assert data["email"] == test_email, "Returned email does not match login email"
    assert isinstance(data["_id"], str) and len(data["_id"]) > 0, "_id is not a non-empty string"
    assert isinstance(data["name"], str) and len(data["name"]) > 0, "name is not a non-empty string"
    assert isinstance(data["token"], str) and len(data["token"]) > 0, "token is not a non-empty string"

test_post_api_auth_login_authenticates_user()