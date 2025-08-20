from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes import user_routes, feedback_routes, crime_report_routes, history_routes, location_routes, ranking_routes, sms_routes  # Importing the user and feedback routes
from controllers import auth_controller  # Importing the auth controller
# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# CORS Middleware Setup
origins = [
    "*",  # Allow all origins, adjust if needed for security
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the user and feedback routes
app.include_router(auth_controller.router)
app.include_router(user_routes.router)
app.include_router(feedback_routes.router)
app.include_router(crime_report_routes.router)
app.include_router(history_routes.router)
app.include_router(location_routes.router)
app.include_router(ranking_routes.router)
app.include_router(sms_routes.router)
# Getting the port from environment variables or defaulting to 3001
port = os.getenv("PORT", 8000)

# Run the FastAPI server (using `uvicorn` command for development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000,reload=True)
