import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "hackathon-secret-change-in-prod")
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///reimbursement.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-hackathon-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "pdf"}
    