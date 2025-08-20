import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MySQL connection setup
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),  # Default to localhost
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            port=int(os.getenv("PORT")),
            unix_socket=None
        )
        
        if connection.is_connected():
            print("✅ Connected to MySQL")
            return connection
    except Error as e:
        print(f"❌ MySQL connection failed: {e}")
        return None
