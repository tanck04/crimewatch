from typing import List, Dict
from utils.ranking_utils import normalize, DIVCODE_TO_DIVISION, parse_ranking_file

# Load ranking data once at module level
ranking_data = parse_ranking_file("data/FivePreventableCrimeCasesRecordedByNeighbourhoodPoliceCentreNPCAnnual.csv")

def get_top_crimes(
    station_name: str,
    divcode: str
) -> List[str]:
    norm_station = normalize(station_name)

    # Try matching exact station
    for full_station in ranking_data:
        if norm_station in normalize(full_station):
            crime_dict = ranking_data[full_station]
            sorted_crimes = sorted(crime_dict.items(), key=lambda x: x[1][0], reverse=True)
            return [crime for crime, _ in sorted_crimes[:3]]

    # Fallback: Try matching division
    division_name = DIVCODE_TO_DIVISION.get(divcode)
    if division_name:
        for full_station in ranking_data:
            if division_name in full_station:
                crime_dict = ranking_data[full_station]
                sorted_crimes = sorted(crime_dict.items(), key=lambda x: x[1][0], reverse=True)
                return [crime for crime, _ in sorted_crimes[:3]]

    return []
