import requests

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_get_api_my_news_preferences_returns_user_topics():
    # First login to get a valid JWT token (using a known test user)
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        assert 'token' in login_data, "Token not found in login response"
        token = login_data['token']

        # Use token to call GET /api/my-news/preferences
        prefs_url = f"{BASE_URL}/my-news/preferences"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        prefs_response = requests.get(prefs_url, headers=headers, timeout=TIMEOUT)
        assert prefs_response.status_code == 200, f"Preferences request failed with status {prefs_response.status_code}"
        prefs_data = prefs_response.json()
        assert isinstance(prefs_data, dict), "Preferences response is not a dictionary"
        assert "preferences" in prefs_data, "'preferences' key not in response"
        # preferences should be a list or dict representing user topic preferences
        prefs = prefs_data["preferences"]
        assert prefs is not None, "Preferences value is None"
    except requests.RequestException as e:
        assert False, f"Request error occurred: {e}"

test_get_api_my_news_preferences_returns_user_topics()