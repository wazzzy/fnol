"""
OCR tool — extracts text from images or PDFs.
Uses pytesseract for local OCR; swap to a cloud OCR API for production.
"""

import io
from typing import Optional

try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


def extract_text_from_image(image_bytes: bytes, lang: str = "eng") -> str:
    """Extract text from an image using Tesseract OCR."""
    if not OCR_AVAILABLE:
        return "[OCR not available — pytesseract/Pillow not installed]"
    image = Image.open(io.BytesIO(image_bytes))
    return pytesseract.image_to_string(image, lang=lang)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        return f"[PDF extraction error: {e}]"


def classify_document(text: str) -> str:
    """
    Heuristic document classifier.
    Returns: police_report | repair_estimate | insurance_card | driver_license | other
    """
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["police", "officer", "incident report", "badge"]):
        return "police_report"
    if any(kw in text_lower for kw in ["repair", "estimate", "labor", "parts", "shop"]):
        return "repair_estimate"
    if any(kw in text_lower for kw in ["insurance", "policy number", "coverage", "insured"]):
        return "insurance_card"
    if any(kw in text_lower for kw in ["driver", "license", "dob", "date of birth", "dmv"]):
        return "driver_license"
    return "other"
