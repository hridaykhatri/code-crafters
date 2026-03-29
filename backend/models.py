from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="employee")
    department = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    claims = db.relationship("ReimbursementClaim", foreign_keys="ReimbursementClaim.user_id", back_populates="user")
    receipts = db.relationship("Receipt", back_populates="uploaded_by")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "department": self.department,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class ExpenseCategory(db.Model):
    __tablename__ = "expense_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    max_limit = db.Column(db.Float, nullable=True)
    requires_receipt = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)

    claims = db.relationship("ReimbursementClaim", back_populates="category")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "max_limit": self.max_limit,
            "requires_receipt": self.requires_receipt,
            "is_active": self.is_active,
        }


class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_hash = db.Column(db.String(64), index=True)
    mime_type = db.Column(db.String(100))
    file_size_bytes = db.Column(db.Integer)

    ocr_raw_text = db.Column(db.Text, nullable=True)
    ocr_merchant = db.Column(db.String(255), nullable=True)
    ocr_amount = db.Column(db.Float, nullable=True)
    ocr_date = db.Column(db.String(50), nullable=True)
    ocr_confidence = db.Column(db.Float, nullable=True)

    is_duplicate = db.Column(db.Boolean, default=False)
    duplicate_of_id = db.Column(db.Integer, db.ForeignKey("receipts.id"), nullable=True)

    uploaded_by_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    uploaded_by = db.relationship("User", back_populates="receipts")
    claim = db.relationship("ReimbursementClaim", back_populates="receipt", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "ocr_merchant": self.ocr_merchant,
            "ocr_amount": self.ocr_amount,
            "ocr_date": self.ocr_date,
            "ocr_confidence": self.ocr_confidence,
            "is_duplicate": self.is_duplicate,
            "duplicate_of_id": self.duplicate_of_id,
            "uploaded_at": self.uploaded_at.isoformat(),
        }


class ReimbursementClaim(db.Model):
    __tablename__ = "reimbursement_claims"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="USD")
    expense_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="draft")

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("expense_categories.id"), nullable=True)
    receipt_id = db.Column(db.Integer, db.ForeignKey("receipts.id"), nullable=True)
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    reviewer_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", foreign_keys=[user_id], back_populates="claims")
    reviewer = db.relationship("User", foreign_keys=[reviewed_by_id])
    category = db.relationship("ExpenseCategory", back_populates="claims")
    receipt = db.relationship("Receipt", back_populates="claim")
    audit_logs = db.relationship("AuditLog", back_populates="claim")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "amount": self.amount,
            "currency": self.currency,
            "expense_date": self.expense_date.isoformat(),
            "status": self.status,
            "reviewer_notes": self.reviewer_notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "user": self.user.to_dict() if self.user else None,
            "receipt": self.receipt.to_dict() if self.receipt else None,
            "category": self.category.to_dict() if self.category else None,
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey("reimbursement_claims.id"))
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    action = db.Column(db.String(100), nullable=False)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    claim = db.relationship("ReimbursementClaim", back_populates="audit_logs")
    actor = db.relationship("User")
    