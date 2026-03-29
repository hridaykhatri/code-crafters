from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from models import ReimbursementClaim
from sqlalchemy import func

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    total = db.session.query(func.count(ReimbursementClaim.id)).scalar()
    total_amount = db.session.query(func.sum(ReimbursementClaim.amount)).scalar() or 0
    pending = db.session.query(func.count(ReimbursementClaim.id)).filter_by(status="pending").scalar()
    approved = db.session.query(func.count(ReimbursementClaim.id)).filter_by(status="approved").scalar()
    rejected = db.session.query(func.count(ReimbursementClaim.id)).filter_by(status="rejected").scalar()

    return jsonify({
        "total_claims": total,
        "total_amount": float(total_amount),
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }), 200

@analytics_bp.route("/by-category", methods=["GET"])
@jwt_required()
def by_category():
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    results = db.session.query(
        ReimbursementClaim.category,
        func.count(ReimbursementClaim.id),
        func.sum(ReimbursementClaim.amount)
    ).group_by(ReimbursementClaim.category).all()

    return jsonify([
        {"category": r[0], "count": r[1], "total_amount": float(r[2] or 0)}
        for r in results
    ]), 200

@analytics_bp.route("/by-employee", methods=["GET"])
@jwt_required()
def by_employee():
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    results = db.session.query(
        ReimbursementClaim.employee_id,
        func.count(ReimbursementClaim.id),
        func.sum(ReimbursementClaim.amount)
    ).group_by(ReimbursementClaim.employee_id).all()

    return jsonify([
        {"employee_id": r[0], "count": r[1], "total_amount": float(r[2] or 0)}
        for r in results
    ]), 200
    