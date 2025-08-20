import json
import os
import requests
from utils.haversine import haversine
from dotenv import load_dotenv
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCATION_FILE = os.path.join(BASE_DIR, '../data/SingaporePoliceForceEstablishments2018GEOJSON.geojson')

load_dotenv()

#Load environment variables from .env file
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

def load_location_data():
    # Load location data from JSON file
    with open(LOCATION_FILE, 'r') as file:
        return json.load(file)

def get_nearest_5(user_lat, user_lon):
    locations = load_location_data()
    results = []

    for location in locations["features"]:
        lon, lat = location['geometry']['coordinates'][:2]
        distance = haversine(user_lat, user_lon, lat, lon)

        # Parse HTML description
        desc_html = location['properties'].get('Description', '')
        soup = BeautifulSoup(desc_html, "html.parser")

        bldg_name = None
        divcode = None

        for row in soup.find_all("tr"):
            th = row.find("th")
            td = row.find("td")
            if th and td:
                label = th.get_text(strip=True)
                value = td.get_text(strip=True)
                if label == "BLDG":
                    bldg_name = value
                elif label == "DIVCODE":
                    divcode = value

        results.append({
            "name": bldg_name,
            "divcode": divcode,
            "latitude": lat,
            "longitude": lon,
            "distance": distance,
            "raw": location
        })

    sorted_results = sorted(results, key=lambda x: x["distance"])
    return sorted_results[:5]


def get_nearest_location(user_lat, user_lon):
    nearest_locations = get_nearest_5(user_lat, user_lon)

    destinations = [f"{loc['latitude']},{loc['longitude']}" for loc in nearest_locations]
    origins = f"{user_lat},{user_lon}"

    endpoint = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origins,
        "destinations": "|".join(destinations),
        "key": API_KEY,
        "mode": "driving",
        "units": "metric"
    }

    response = requests.get(endpoint, params=params)
    data = response.json()

    if data["status"] != "OK":
        raise Exception(f"Distance Matrix API Error: {data['status']}")

    durations = data["rows"][0]["elements"]

    for i, elem in enumerate(durations):
        if elem["status"] == "OK":
            nearest_locations[i]["travel_distance_km"] = elem["distance"]["value"] / 1000
            nearest_locations[i]["travel_time_min"] = elem["duration"]["value"] / 60
        else:
            nearest_locations[i]["travel_distance_km"] = float("inf")
            nearest_locations[i]["travel_time_min"] = float("inf")

    sorted_by_time = sorted(nearest_locations, key=lambda x: x["travel_time_min"])
    return sorted_by_time[0]


"""
def get_nearest_location(user_lat, user_lon):
    locations = load_location_data()
    results = []

    for location in locations["features"]:
        lon, lat = location['geometry']['coordinates'][:2]
        distance = haversine(user_lat, user_lon, lat, lon)

        # Parse HTML description
        desc_html = location['properties'].get('Description', '')
        soup = BeautifulSoup(desc_html, "html.parser")

        bldg_name = None
        divcode = None

        for row in soup.find_all("tr"):
            th = row.find("th")
            td = row.find("td")
            if th and td:
                label = th.get_text(strip=True)
                value = td.get_text(strip=True)
                if label == "BLDG":
                    bldg_name = value
                elif label == "DIVCODE":
                    divcode = value

        results.append({
            "name": bldg_name,
            "divcode": divcode,
            "latitude": lat,
            "longitude": lon,
            "distance": distance,
            "raw": location
        })

    sorted_results = sorted(results, key=lambda x: x["distance"])
    return sorted_results[0]
"""