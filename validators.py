import re


def is_valid_email(email):
    if not email or not isinstance(email, str):
        return False
    try:
        return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None
    except Exception:
        return False


def is_valid_postal_code(code, country=None):
    if not code or not isinstance(code, str):
        return False
    c = code.strip()
    if country and country.lower() in ('pe', 'peru'):
        return re.match(r'^\d{5}$', c) is not None
    return re.match(r'^[A-Za-z0-9\- ]{3,10}$', c) is not None


def is_valid_address(addr):
    if not addr or not isinstance(addr, str):
        return False
    if len(addr.strip()) < 5:
        return False
    if re.search(r"\d", addr):
        return True
    if re.search(r"(?i)\b(calle|avenida|av\.?|jr\.?|psje\.?|pasaje|prol\.?|urbaniz|street|st\.?|ave\.?|road|rd\.|lane|ln\.)\b", addr):
        return True
    return False
