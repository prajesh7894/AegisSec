import pytest

from app.services.target_validation import classify_target


@pytest.mark.parametrize(
    ("target", "expected"),
    [
        ("example.com", "domain"),
        ("https://example.com", "url"),
        ("192.168.1.10", "ip"),
        ("2001:db8::1", "ip"),
    ],
)
def test_classify_target_accepts_valid_targets(target: str, expected: str) -> None:
    assert classify_target(target) == expected


@pytest.mark.parametrize("target", ["", "not a host", "ftp://example.com", "http://"])
def test_classify_target_rejects_malformed_targets(target: str) -> None:
    with pytest.raises(ValueError):
        classify_target(target)

