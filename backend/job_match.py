import requests
import os

RAPID_KEY = os.getenv("RAPIDAPI_KEY")

def fetch_jobs(query, location="India"):
    url = "https://jsearch.p.rapidapi.com/search"

    params = {
        "query": f"{query} in {location}",
        "page": "1",
        "num_pages": "1",
        "date_posted": "all"
    }

    headers = {
        "x-rapidapi-key": RAPID_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=params)

    data = response.json()
    return data.get("data", [])
