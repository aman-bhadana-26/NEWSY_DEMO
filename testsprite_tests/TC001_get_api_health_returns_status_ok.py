import requests

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_get_api_health_returns_status_ok():
    url = f"{BASE_URL}/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(json_data, dict), "Response JSON is not an object"
    assert "status" in json_data, "Response JSON missing 'status' key"
    assert "message" in json_data, "Response JSON missing 'message' key"
    assert str(json_data["status"]).lower() == "ok", f"Expected 'status' to be 'OK', got {json_data['status']}"
    assert isinstance(json_data["message"], str) and len(json_data["message"]) > 0, "Response 'message' is empty or not a string"

test_get_api_health_returns_status_ok()