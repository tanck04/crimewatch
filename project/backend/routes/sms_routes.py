from fastapi import APIRouter
from pydantic import BaseModel
from utils.sms_utils import send_sms_by_divcode

router = APIRouter()

class SMSRequest(BaseModel):
    divcode: str
    message: str

@router.post("/api/send-sms")
def send_sms_endpoint(request: SMSRequest):
    result = send_sms_by_divcode(request.divcode, request.message)
    return {"result": result}
