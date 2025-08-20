from fastapi import FastAPI, HTTPException, Body, Header
from pydantic import BaseModel
import jwt
import os
from config.db import get_db_connection
from dotenv import load_dotenv
from fastapi import APIRouter

router = APIRouter()
# Load environment variables
load_dotenv()

app = FastAPI()

@router.get("/api/history")
async def get_user_reports_by_email(authorization: str = Header(...)):
    """Fetch reports submitted by the logged-in user using their user ID"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # Decode JWT
        decoded_token = jwt.decode(token, os.getenv("JWT_SECRET", "your_jwt_secret"), algorithms=["HS256"])
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Fetch all reports for this user
        # Fetch user email using user ID
        cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_email = user["email"]

        schema_query = "DESCRIBE crime_reports"
        cursor.execute(schema_query)
        schema = cursor.fetchall()
        query = "SELECT crime_type, location, police_station, submitted_at  AS created_at FROM crime_reports WHERE email = %s"
        cursor.execute(query, (user_email,))
        try:
            reports = cursor.fetchall()
        except Exception as fetch_error:
            print(f"Error fetching reports: {fetch_error}")
            raise HTTPException(status_code=500, detail="Error fetching reports")

        return reports  # Just return the list directly
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
    finally:
        cursor.close()
        connection.close()
