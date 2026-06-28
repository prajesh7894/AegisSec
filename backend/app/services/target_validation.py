import ipaddress
import re
from urllib.parse import urlparse


DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$"
)


class TargetValidationError(ValueError):
    pass


def classify_target(target: str) -> str:
    value = target.strip()
    if not value:
        raise TargetValidationError("Target is required.")

    parsed = urlparse(value)
    if parsed.scheme:
        if parsed.scheme in {"http", "https"} and parsed.hostname and DOMAIN_RE.match(parsed.hostname):
            return "url"
        raise TargetValidationError("Target URL must use HTTP or HTTPS and include a valid hostname.")

    host = parsed.hostname if parsed.scheme else value

    try:
        ipaddress.ip_address(host)
        return "ip"
    except ValueError:
        pass

    if DOMAIN_RE.match(host):
        return "domain"

    raise TargetValidationError("Target must be a valid domain, IP address, or HTTP(S) URL.")


def validate_target(target: str) -> None:
    try:
        classify_target(target)
    except TargetValidationError as exc:
        raise ValueError(str(exc)) from exc
