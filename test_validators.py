import pytest
from validators import is_valid_email, is_valid_address, is_valid_postal_code


def test_valid_emails():
    assert is_valid_email('user@example.com')
    assert is_valid_email('john.doe+test@sub.domain.co')


def test_invalid_emails():
    assert not is_valid_email('')
    assert not is_valid_email('no-at-symbol')
    assert not is_valid_email('bad@domain')


def test_valid_addresses():
    assert is_valid_address('Av. Los Álamos 123')
    assert is_valid_address('Calle Falsa 123')
    assert is_valid_address('Jr. Amazonas')
    assert is_valid_address('123 Main St')


def test_invalid_addresses():
    assert not is_valid_address('')
    assert not is_valid_address('Centro')
    assert not is_valid_address('Apt')


def test_postal_codes_peru():
    assert is_valid_postal_code('15046', country='PE')
    assert not is_valid_postal_code('ABCDE', country='PE')
    assert not is_valid_postal_code('123', country='PE')


def test_postal_codes_generic():
    assert is_valid_postal_code('1000')
    assert is_valid_postal_code('AB-123')
    assert not is_valid_postal_code('!!@@###')
