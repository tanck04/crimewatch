from fastapi import APIRouter, HTTPException, Header
from config.db import get_db_connection
from models.crime_report_model import CrimeReportRequest  # Ensure this imports your Pydantic model for crime report
import jwt
import os
router = APIRouter()



@router.post("/api/crime-report")
async def submit_crime_report(
    report: CrimeReportRequest,
    authorization: str = Header(...),
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]

    # Ensure the JWT_SECRET is set in your environment variables
    secret_key = os.getenv("JWT_SECRET", "your_jwt_secret")
    if not secret_key:
        raise HTTPException(status_code=500, detail="JWT_SECRET is not set")
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        # Decode JWT token
        decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])

        # Extract userId from the decoded token
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token: userId missing")

        # Fetch user details from the database to validate
        cursor.execute("SELECT id, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Insert crime report into the database
        cursor.execute(
            """
            INSERT INTO crime_reports (crime_type, location, email, latitude, longitude, police_station)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (report.crime_type, report.location, report.email, report.latitude, report.longitude, report.police_station)
        )
        connection.commit()

        return {"msg": "Crime report submitted successfully"}

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        connection.close()