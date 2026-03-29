from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from models import User

def register_user(data):
    if User.query.filter_by(email=data["email"]).first():
        return {"error": "Email already registered"}, 409

    hashed_pw = generate_password_hash(data["password"])
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_pw,
        role=data.get("role", "employee")
    )
    db.session.add(user)
    db.session.commit()
    return {"message": "User registered successfully"}, 201

def login_user(data):
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return {"error": "Invalid email or password"}, 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "name": user.name}
    )
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }, 200
    