from fastapi import APIRouter, HTTPException
from controllers.location_controller import get_nearest_location

router = APIRouter()

@router.get("/api/location/nearest")
def nearest_station(lat: float, lon: float):
    try:
        nearest = get_nearest_location(lat, lon)
        return {"nearest_station": nearest}
    except Exception as e:
        print("🔥 ERROR in nearest_station:", str(e))
        raise HTTPException(status_code=500, detail=str(e))