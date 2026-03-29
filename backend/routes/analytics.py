from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from models import ReimbursementClaim, User
from sqlalchemy import func

analytics_bp = Blueprint("analytics_main", __name__)

@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    total = db.session.query(func.count(ReimbursementClaim.id)).scalar()
    total_amount = db.session.query(func.sum(ReimbursementClaim.amount)).scalar() or 0
    pending = db.session.query(func.count(ReimbursementClaim.id)).filter_by(status="pending").scalar()
    approved = db.session.query(func.count(ReimbursementClaim.id)).filter_by(status="approved").scalar()
    rejected = db.session.query(func.count(ReimbursementClaim.id)).filter_by(status="rejected").scalar()

    by_category = db.session.query(
        ReimbursementClaim.category,
        func.count(ReimbursementClaim.id),
        func.sum(ReimbursementClaim.amount)
    ).group_by(ReimbursementClaim.category).all()

    return jsonify({
        "total_claims": total,
        "total_amount": float(total_amount),
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "by_category": [
            {"category": r[0], "count": r[1], "total": float(r[2] or 0)}
            for r in by_category
        ]
    }), 200
    