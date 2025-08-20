from fastapi import FastAPI, HTTPException, Body, Header
import bcrypt
import jwt
import os
from config.db import get_db_connection
from dotenv import load_dotenv
from fastapi import APIRouter
from datetime import datetime, timedelta
from models.user_model import UserLogin, UserSignup, UserCheck, UserCheck2, UserUpdate

router = APIRouter()
# Load environment variables
load_dotenv()

app = FastAPI()

@router.get("/api/users")
async def get_user_info(authorization: str = Header(...)):
    """Fetch user information based on the provided Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]
    """Fetch user information based on the provided token"""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # Decode the JWT token to extract user ID
        decoded_token = jwt.decode(token, os.getenv("JWT_SECRET", "your_jwt_secret"), algorithms=["HS256"])
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Fetch user details from the database
        cursor.execute("SELECT id, name, email, phone FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
    finally:
        cursor.close()
        connection.close()

@router.get("/api/users/email")
async def get_user_info(authorization: str = Header(...)):
    """Fetch user information based on the provided Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]
    """Fetch user information based on the provided token"""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # Decode the JWT token to extract user ID
        decoded_token = jwt.decode(token, os.getenv("JWT_SECRET", "your_jwt_secret"), algorithms=["HS256"])
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Fetch user details from the database
        cursor.execute("SELECT id, name, email, phone FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"email": user["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
    finally:
        cursor.close()
        connection.close()

\

@router.put("/api/users/update")
async def update_user(update: UserUpdate, authorization: str = Header(...)):
    """Update user profile and optionally password"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    token = authorization.split("Bearer ")[1]

    try:
        decoded_token = jwt.decode(token, os.getenv("JWT_SECRET", "your_jwt_secret"), algorithms=["HS256"])
        user_id = decoded_token.get("userId")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    try:
        # Check for duplicate email/phone
        cursor.execute("""
            SELECT id FROM users WHERE (phone = %s) AND id != %s
        """, (update.phone, user_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Phone already in use by another user.")

        # If password change is requested
        if update.current_password and update.new_password:
            cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")

            # Validate current password
            if not bcrypt.checkpw(update.current_password.encode('utf-8'), row['password'].encode('utf-8')):
                raise HTTPException(status_code=403, detail="Incorrect current password")

            # Hash new password
            hashed_new_password = bcrypt.hashpw(update.new_password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("""
                UPDATE users SET name = %s, phone = %s, password = %s WHERE id = %s
            """, (update.name, update.phone, hashed_new_password, user_id))
        else:
            # No password change
            cursor.execute("""
                UPDATE users SET name = %s, phone = %s WHERE id = %s
            """, (update.name, update.phone, user_id))

        connection.commit()
        return {"msg": "Profile updated successfully!"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()
