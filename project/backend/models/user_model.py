from pydantic import BaseModel
# Pydantic model for request validation
class UserSignup(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserCheck(BaseModel):
    email: str
    phone: str

class UserCheck2(BaseModel):
    email: str

class UserUpdate(BaseModel):
    name: str
    phone: str
    current_password: str | None = None
    new_password: str | None = None