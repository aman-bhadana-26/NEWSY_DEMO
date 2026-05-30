import requests

BASE_URL = "http://localhost:5000/api"
TIMEOUT = 30

def test_post_api_news_article_content_extracts_content():
    url = f"{BASE_URL}/news/article-content"
    payload = {
        "url": "https://techcrunch.com/2024/06/20/sample-article-for-testing/"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        json_response = response.json()
        assert "content" in json_response, "Response JSON does not contain 'content' key"
        assert isinstance(json_response["content"], str), "'content' should be a string"
        assert len(json_response["content"].strip()) > 0, "'content' should not be empty"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_news_article_content_extracts_content()