import requests
import uuid

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def delete_api_auth_profile_picture_removes_image():
    # Register a new user to get a valid token
    register_url = f"{BASE_URL}/auth/register"
    test_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    register_payload = {
        "name": "Test User",
        "email": test_email,
        "password": "TestPass123!"
    }
    try:
        register_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert register_resp.status_code == 201, f"Registration failed: {register_resp.text}"
        register_data = register_resp.json()
        token = register_data.get("token")
        assert token, "No token received on registration"
        
        headers = {"Authorization": f"Bearer {token}"}

        # Upload a profile picture first to ensure there is one to delete
        upload_url = f"{BASE_URL}/auth/profile/picture"
        image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00"
        files = {
            "profilePicture": ("test.png", image_content, "image/png")
        }
        upload_resp = requests.post(upload_url, headers=headers, files=files, timeout=TIMEOUT)
        assert upload_resp.status_code == 200, f"Profile picture upload failed: {upload_resp.text}"
        upload_data = upload_resp.json()
        assert "profilePicture" in upload_data, "profilePicture key not in upload response"

        # Now delete the profile picture
        delete_url = f"{BASE_URL}/auth/profile/picture"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code == 200, f"Delete profile picture failed: {delete_resp.text}"
        delete_data = delete_resp.json()
        assert "message" in delete_data and isinstance(delete_data["message"], str), "No confirmation message in delete response"
    finally:
        # Cleanup: delete created user if possible (no endpoint specified but this is a best effort placeholder)
        pass

delete_api_auth_profile_picture_removes_image()