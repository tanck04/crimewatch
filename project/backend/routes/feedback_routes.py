from fastapi import APIRouter, HTTPException, Header
from config.db import get_db_connection  # Ensure this imports your database connection logic
from models.feedback_model import FeedbackRequest  # Ensure this imports your Pydantic model for feedback
import jwt
import os

router = APIRouter()

@router.post("/api/feedback")
async def submit_feedback(
    feedback: FeedbackRequest,
    authorization: str = Header(...),  # Extract the Authorization header
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

        # Insert feedback into the database
        cursor.execute(
            "INSERT INTO feedbacks (email, rating, comment) VALUES (%s, %s, %s)",
            (feedback.email, feedback.rating, feedback.message)
        )
        connection.commit()

        return {"msg": "Feedback submitted successfully"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        connection.close()
