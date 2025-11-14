import os
import uuid
import bleach
from .config import settings

ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + ["p", "br", "img", "span", "div", "table", "thead", "tbody", "tr", "td", "th", "hr"]
ALLOWED_ATTRS = {**bleach.sanitizer.ALLOWED_ATTRIBUTES, "img": ["src", "alt"], "a": ["href", "title", "target", "rel"], "*": ["style", "class"]}

def sanitize_html(html: str) -> str:
    return bleach.clean(html or "", tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)

def ensure_attachments_dir():
    os.makedirs(settings.ATTACHMENTS_DIR, exist_ok=True)

def save_attachment(fileobj, filename: str) -> tuple[str, int]:
    ensure_attachments_dir()
    ext = os.path.splitext(filename)[1]
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.ATTACHMENTS_DIR, name)
    size = 0
    with open(path, "wb") as f:
        while True:
            chunk = fileobj.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
            size += len(chunk)
    return path, size
