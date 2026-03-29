from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from models import ReimbursementClaim, AuditLog
import os
from werkzeug.utils import secure_filename
from config import Config

reimb_bp = Blueprint("reimbursements", __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@reimb_bp.route("/", methods=["GET"])
@jwt_required()
def get_claims():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if claims["role"] in ("manager", "admin"):
        reimbursements = ReimbursementClaim.query.all()
    else:
        reimbursements = ReimbursementClaim.query.filter_by(employee_id=user_id).all()
    return jsonify([r.to_dict() for r in reimbursements]), 200

@reimb_bp.route("/", methods=["POST"])
@jwt_required()
def create_claim():
    user_id = get_jwt_identity()
    data = request.form
    file = request.files.get("receipt")

    receipt_path = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        receipt_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(receipt_path)

    claim = ReimbursementClaim(
        employee_id=user_id,
        title=data.get("title"),
        amount=float(data.get("amount", 0)),
        category=data.get("category"),
        description=data.get("description"),
        receipt_path=receipt_path
    )
    db.session.add(claim)
    db.session.commit()
    return jsonify(claim.to_dict()), 201

@reimb_bp.route("/<int:claim_id>", methods=["GET"])
@jwt_required()
def get_claim(claim_id):
    claim = ReimbursementClaim.query.get_or_404(claim_id)
    return jsonify(claim.to_dict()), 200

@reimb_bp.route("/<int:claim_id>", methods=["PUT"])
@jwt_required()
def update_claim(claim_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    claim = ReimbursementClaim.query.get_or_404(claim_id)

    if claims["role"] in ("manager", "admin"):
        status = request.get_json().get("status")
        if status:
            old_status = claim.status
            claim.status = status
            log = AuditLog(
                claim_id=claim.id,
                actor_id=user_id,
                action="status_change",
                old_value=old_status,
                new_value=status
            )
            db.session.add(log)
    else:
        data = request.get_json()
        claim.title = data.get("title", claim.title)
        claim.amount = data.get("amount", claim.amount)
        claim.category = data.get("category", claim.category)
        claim.description = data.get("description", claim.description)

    db.session.commit()
    return jsonify(claim.to_dict()), 200

@reimb_bp.route("/<int:claim_id>", methods=["DELETE"])
@jwt_required()
def delete_claim(claim_id):
    claim = ReimbursementClaim.query.get_or_404(claim_id)
    db.session.delete(claim)
    db.session.commit()
    return jsonify({"message": "Claim deleted"}), 200
    