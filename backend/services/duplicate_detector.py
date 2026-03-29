from models import ReimbursementClaim
from datetime import timedelta

def check_duplicate(employee_id, amount, date=None):
    """
    Check if a similar claim already exists for the same employee.
    Flags as duplicate if: same employee + same amount + within 7 days
    """
    query = ReimbursementClaim.query.filter_by(
        employee_id=employee_id,
        amount=amount
    )

    existing_claims = query.all()

    if not existing_claims:
        return {"is_duplicate": False}

    if date:
        for claim in existing_claims:
            if claim.created_at and abs((claim.created_at - date).days) <= 7:
                return {
                    "is_duplicate": True,
                    "reason": "Same amount submitted within 7 days",
                    "existing_claim_id": claim.id,
                    "existing_claim_date": str(claim.created_at)
                }
    else:
        return {
            "is_duplicate": True,
            "reason": "Same amount already submitted",
            "existing_claim_id": existing_claims[0].id,
            "existing_claim_date": str(existing_claims[0].created_at)
        }

    return {"is_duplicate": False}


def check_duplicate_receipt(receipt_text, employee_id):
    """
    Check duplicate based on OCR extracted text similarity
    """
    if not receipt_text:
        return {"is_duplicate": False}

    existing = ReimbursementClaim.query.filter_by(
        employee_id=employee_id
    ).all()

    for claim in existing:
        if claim.ocr_text and similarity_score(claim.ocr_text, receipt_text) > 0.85:
            return {
                "is_duplicate": True,
                "reason": "Very similar receipt already submitted",
                "existing_claim_id": claim.id
            }

    return {"is_duplicate": False}


def similarity_score(text1, text2):
    """
    Simple word overlap similarity between two texts
    """
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    if not words1 or not words2:
        return 0
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union)
    