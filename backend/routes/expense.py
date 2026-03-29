from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from models import ReimbursementClaim

expense_bp = Blueprint("expense", __name__)

@expense_bp.route("/", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims["role"] in ("manager", "admin"):
        expenses = ReimbursementClaim.query.all()
    else:
        expenses = ReimbursementClaim.query.filter_by(employee_id=user_id).all()
    return jsonify([e.to_dict() for e in expenses]), 200

@expense_bp.route("/pending", methods=["GET"])
@jwt_required()
def get_pending():
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403
    expenses = ReimbursementClaim.query.filter_by(status="pending").all()
    return jsonify([e.to_dict() for e in expenses]), 200

@expense_bp.route("/approved", methods=["GET"])
@jwt_required()
def get_approved():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims["role"] in ("manager", "admin"):
        expenses = ReimbursementClaim.query.filter_by(status="approved").all()
    else:
        expenses = ReimbursementClaim.query.filter_by(
            employee_id=user_id, status="approved"
        ).all()
    return jsonify([e.to_dict() for e in expenses]), 200
    