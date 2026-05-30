import requests

BASE_URL = "http://localhost:5000/api"

def test_get_api_news_returns_paginated_articles():
    url = f"{BASE_URL}/news"
    params = {
        "page": 1,
        "category": "technology"
    }
    try:
        response = requests.get(url, params=params, timeout=30)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, dict), "Response is not a JSON object"
        assert data.get("success") is True or data.get("success") == True, "Response 'success' is not True"
        assert "totalResults" in data, "'totalResults' key missing in response"
        assert isinstance(data["totalResults"], int), "'totalResults' is not an integer"
        assert "articles" in data, "'articles' key missing in response"
        assert isinstance(data["articles"], list), "'articles' is not a list"
        assert "page" in data, "'page' key missing in response"
        assert isinstance(data["page"], int), "'page' is not an integer"
        assert data["page"] == params["page"], f"Response page {data['page']} does not match requested page {params['page']}"
        assert "pageSize" in data, "'pageSize' key missing in response"
        assert isinstance(data["pageSize"], int), "'pageSize' is not an integer"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_news_returns_paginated_articles()