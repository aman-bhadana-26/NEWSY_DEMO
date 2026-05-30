import requests
import io

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def post_api_auth_profile_picture_uploads_image():
    # First, register a new user to obtain a token for authentication
    register_url = f"{BASE_URL}/auth/register"
    user_data = {
        "name": "Test User",
        "email": "unique_testuser_profilepic_upload@example.com",
        "password": "TestPassw0rd!"
    }
    try:
        reg_resp = requests.post(register_url, json=user_data, timeout=TIMEOUT)
        assert reg_resp.status_code == 201, f"Unexpected status code from register: {reg_resp.status_code}"
        reg_json = reg_resp.json()
        token = reg_json.get("token")
        assert token, "No token found in register response"

        upload_url = f"{BASE_URL}/auth/profile/picture"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Use a small sample image created in memory (1x1 px PNG)
        # PNG header + minimal data for a valid PNG
        image_bytes = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
            b'\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89'
            b'\x00\x00\x00\nIDATx\xdac\xf8\x0f\x00\x01\x01\x01\x00'
            b'\x18\xdd\xdc\xdc\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        files = {
            "picture": ("test_image.png", io.BytesIO(image_bytes), "image/png")
        }

        resp = requests.post(upload_url, headers=headers, files=files, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        resp_json = resp.json()
        assert "profilePicture" in resp_json, "Response JSON missing 'profilePicture' key"
        profile_picture_url = resp_json["profilePicture"]
        assert isinstance(profile_picture_url, str) and profile_picture_url.strip(), "profilePicture URL is empty or not a string"

    finally:
        pass

post_api_auth_profile_picture_uploads_image()
