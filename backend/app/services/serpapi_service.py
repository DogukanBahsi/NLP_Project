import os
import requests
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_KEY")


def search_google_maps_hotels(query: str):
    url = "https://serpapi.com/search.json"

    params = {
        "engine": "google_maps",
        "q": query,
        "type": "search",
        "api_key": SERPAPI_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []

    for item in data.get("local_results", []):
        results.append({
            "title": item.get("title"),
            "place_id": item.get("place_id"),
            "data_id": item.get("data_id"),
            "rating": item.get("rating"),
            "reviews": item.get("reviews"),
            "address": item.get("address")
        })

    return results


def get_google_maps_reviews(data_id: str, max_reviews: int = 100):
    url = "https://serpapi.com/search.json"

    all_reviews = []
    next_page_token = None

    while len(all_reviews) < max_reviews:
        params = {
            "engine": "google_maps_reviews",
            "data_id": data_id,
            "api_key": SERPAPI_KEY
        }

        if next_page_token:
            params["next_page_token"] = next_page_token

        response = requests.get(url, params=params)
        data = response.json()

        print("SERPAPI KEYS:", data.keys())
        print("PAGINATION:", data.get("serpapi_pagination"))
        print("REVIEWS COUNT:", len(data.get("reviews", [])))

        reviews = data.get("reviews", [])

        if not reviews:
            break

        for item in reviews:
            all_reviews.append({
                "reviewer_name": item.get("user", {}).get("name"),
                "rating": item.get("rating"),
                "comment": item.get("snippet"),
                "date": item.get("date")
            })

            if len(all_reviews) >= max_reviews:
                break

        pagination = data.get("serpapi_pagination", {})

        next_page_token = (
            pagination.get("next_page_token")
            or pagination.get("next_page")
            or pagination.get("next")
        )

        if not next_page_token:
            break

    return all_reviews