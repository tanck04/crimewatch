from pydantic import BaseModel, EmailStr

class CrimeReportRequest(BaseModel):
    crime_type: str
    location: str
    email: EmailStr
    latitude: float
    longitude: float
    police_station: str