import pytesseract
from PIL import Image
import pdf2image
import os
import re

def extract_text_from_file(file_path):
    ext = file_path.rsplit('.', 1)[-1].lower()
    if ext == 'pdf':
        return extract_from_pdf(file_path)
    else:
        return extract_from_image(file_path)

def extract_from_image(file_path):
    try:
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        return parse_receipt(text)
    except Exception as e:
        return {"error": str(e)}

def extract_from_pdf(file_path):
    try:
        pages = pdf2image.convert_from_path(file_path)
        full_text = ""
        for page in pages:
            full_text += pytesseract.image_to_string(page)
        return parse_receipt(full_text)
    except Exception as e:
        return {"error": str(e)}

def parse_receipt(text):
    amount = None
    date = None

    amount_match = re.search(r'(?:total|amount|sum)[^\d]*(\d+[\.,]\d{2})', text, re.IGNORECASE)
    if amount_match:
        amount = float(amount_match.group(1).replace(',', '.'))

    date_match = re.search(r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})', text)
    if date_match:
        date = date_match.group(1)

    return {
        "raw_text": text.strip(),
        "amount": amount,
        "date": date
    }
    