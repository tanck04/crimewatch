import pandas as pd
import re
from bs4 import BeautifulSoup
import json
from typing import List, Tuple, Dict

# -----------------------------
# Constants
# -----------------------------
DIVCODE_TO_DIVISION = {
    "ALPHA": "Central Police Division",
    "DELTA": "Clementi Police Division",
    "ECHO": "Tanglin Police Division",
    "FOXTROT": "Ang Mo Kio Police Division",
    "GOLF": "Bedok Police Division",
    "JULIET": "Jurong Police Division",
    "LIMA": "Woodlands Police Division"
}

# -----------------------------
# Utils: Normalization
# -----------------------------
def normalize(name: str) -> str:
    return re.sub(r"(?i)neighbourhood police centre|neighbourhood police post|npc|npp", "", name).strip().lower()

# -----------------------------
# Ranking File Parser
# -----------------------------
def parse_ranking_file(filepath: str) -> Dict[str, Dict[str, List[int]]]:
    df = pd.read_csv(filepath)
    ranking_data = {}
    current_station = None

    for _, row in df.iterrows():
        name = str(row['DataSeries']).strip()

        if "Police Division" in name:
            current_station = name
            ranking_data[current_station] = {}
        elif current_station:
            crime = name
            crime_data = pd.to_numeric(pd.Series(row.values[1:]), errors="coerce").fillna(0).astype(int).tolist()
            ranking_data[current_station][crime] = crime_data

    return ranking_data

# -----------------------------
# GEOJSON Parser
# -----------------------------
def extract_info_from_geojson(geojson_path: str) -> List[Tuple[str, str]]:
    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    cleaned_data = []

    for feature in geojson_data["features"]:
        props = feature["properties"]
        description_html = props.get("Description", "")
        soup = BeautifulSoup(description_html, "html.parser")
        rows = soup.find_all("tr")

        station_name = None
        divcode = None

        for row in rows:
            th = row.find("th")
            td = row.find("td")
            if th and td:
                label = th.get_text(strip=True)
                value = td.get_text(strip=True)
                if label == "BLDG":
                    station_name = value
                elif label == "DIVCODE":
                    divcode = value

        if station_name and divcode:
            cleaned_data.append((station_name, divcode))

    return cleaned_data
