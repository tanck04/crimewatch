from pydantic import BaseModel

class StationInfo(BaseModel):
    station_name: str
    divcode: str