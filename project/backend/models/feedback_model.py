from pydantic import BaseModel, EmailStr
class FeedbackRequest(BaseModel):
    email: EmailStr
    rating: int
    message: str