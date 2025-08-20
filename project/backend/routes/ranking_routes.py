from fastapi import APIRouter
from models.ranking_models import StationInfo
from controllers.ranking_controller import get_top_crimes

router = APIRouter()

@router.post("/get_top_crimes")
def fetch_top_crimes(info: StationInfo):
    top_crimes = get_top_crimes(info.station_name, info.divcode)
    return {"top_crimes": top_crimes}
