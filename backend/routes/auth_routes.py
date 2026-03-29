from flask import Blueprint, request, jsonify
from auth import register_user, login_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ("name", "email", "password")):
        return jsonify({"error": "Missing required fields"}), 400
    result, status = register_user(data)
    return jsonify(result), status

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing required fields"}), 400
    result, status = login_user(data)
    return jsonify(result), status
    