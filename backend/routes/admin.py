from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import User, ReimbursementClaim
from app import db

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role
    } for u in users]), 200

@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200