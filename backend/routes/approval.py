from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from models import ReimbursementClaim, AuditLog

approval_bp = Blueprint("approval", __name__)

@approval_bp.route("/<int:claim_id>/approve", methods=["POST"])
@jwt_required()
def approve_claim(claim_id):
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    user_id = get_jwt_identity()
    claim = ReimbursementClaim.query.get_or_404(claim_id)
    old_status = claim.status
    claim.status = "approved"

    log = AuditLog(
        claim_id=claim.id,
        actor_id=user_id,
        action="approved",
        old_value=old_status,
        new_value="approved"
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"message": "Claim approved", "claim": claim.to_dict()}), 200

@approval_bp.route("/<int:claim_id>/reject", methods=["POST"])
@jwt_required()
def reject_claim(claim_id):
    claims = get_jwt()
    if claims["role"] not in ("manager", "admin"):
        return jsonify({"error": "Unauthorized"}), 403

    user_id = get_jwt_identity()
    claim = ReimbursementClaim.query.get_or_404(claim_id)
    old_status = claim.status
    claim.status = "rejected"

    data = request.get_json() or {}
    log = AuditLog(
        claim_id=claim.id,
        actor_id=user_id,
        action="rejected",
        old_value=old_status,
        new_value="rejected"
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"message": "Claim rejected", "claim": claim.to_dict()}), 200

@approval_bp.route("/<int:claim_id>/history", methods=["GET"])
@jwt_required()
def claim_history(claim_id):
    logs = AuditLog.query.filter_by(claim_id=claim_id).all()
    return jsonify([{
        "action": l.action,
        "old_value": l.old_value,
        "new_value": l.new_value,
        "timestamp": str(l.timestamp),
        "actor_id": l.actor_id
    } for l in logs]), 200
    