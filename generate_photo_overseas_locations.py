import json
import re
import time
import urllib.parse
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests
import yaml


PHOTO_DIR = Path("_photo")
OUT_JSON = Path("assets/json/photo_overseas_locations.json")

# Nominatim usage policy requires a descriptive User-Agent.
# Change this to your lab/site email if you have one.
NOMINATIM_UA = "BAELAB-PNU.github.io (static site build script; contact: admin@pnubaelab.github.io)"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Countries / tokens that mean "domestic" for this site.
DOMESTIC_COUNTRY_TOKENS = {
    "korea",
    "south korea",
    "republic of korea",
    "대한민국",
    "한국",
}


_HANGUL_RE = re.compile(r"[\uAC00-\uD7A3]")


def _has_hangul(s: str) -> bool:
    return bool(_HANGUL_RE.search(s))


def _split_front_matter(text: str) -> Tuple[Dict[str, Any], str]:
    # Expect standard Jekyll front matter: ---\n...\n---\n
    if not text.lstrip().startswith("---"):
        return {}, text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text

    fm_raw = parts[1]
    body = parts[2]
    data = yaml.safe_load(fm_raw) or {}
    if not isinstance(data, dict):
        return {}, text
    return data, body


def _desc_to_place_parts(description: str) -> List[str]:
    parts = [p.strip() for p in description.split(",")]
    parts = [p for p in parts if p]
    return parts


def _is_overseas(description: Optional[str]) -> bool:
    if not description:
        return False

    parts = _desc_to_place_parts(description)
    if len(parts) < 2:
        # No country-like token; treat as domestic/unknown.
        return False

    country_raw = parts[-1].strip()

    # If the last token contains Hangul, it's not a country string.
    # This prevents misclassifying Korean comma-separated descriptions.
    if _has_hangul(country_raw):
        return False

    country = country_raw.lower()
    country = re.sub(r"\s+", " ", country)
    return country not in DOMESTIC_COUNTRY_TOKENS


def _place_key_from_description(description: str) -> Optional[str]:
    parts = _desc_to_place_parts(description)
    if len(parts) < 2:
        return None

    # Use the last 2 tokens (city/region + country) as the place key.
    city = parts[-2]
    country = parts[-1]

    # Normalize common typos / variants to keep grouping stable.
    if city.strip().lower() == "sanghai":
        city = "Shanghai"

    return f"{city}, {country}"


@dataclass(frozen=True)
class PhotoItem:
    title: str
    img: str
    date: Optional[str]
    description: Optional[str]
    url: Optional[str]


def _normalize_img(img: str) -> str:
    s = str(img).strip()
    if not s:
        return s
    if s.startswith("http://") or s.startswith("https://"):
        return s
    if s.startswith("/"):
        return s
    if s.startswith("assets/"):
        return f"/{s}"
    return s


def _iter_photo_docs() -> Iterable[Tuple[Path, Dict[str, Any]]]:
    for path in sorted(PHOTO_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        fm, _ = _split_front_matter(text)
        if fm:
            yield path, fm


def _parse_date(value: Any) -> Optional[str]:
    if not value:
        return None

    # Most files look like: 2025-09-02 08:59:00-0400
    if isinstance(value, datetime):
        return value.isoformat()

    s = str(value).strip()
    if not s:
        return None

    # Keep as-is (ISO-ish) but normalize common patterns.
    return s


def _nominatim_geocode(place: str, session: requests.Session) -> Optional[Tuple[float, float]]:
    params = {
        "q": place,
        "format": "jsonv2",
        "limit": 1,
    }
    url = f"{NOMINATIM_URL}?{urllib.parse.urlencode(params)}"
    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if not data:
        return None

    lat = float(data[0]["lat"])
    lon = float(data[0]["lon"])
    return lat, lon


def main() -> int:
    if not PHOTO_DIR.exists():
        raise SystemExit(f"Missing folder: {PHOTO_DIR}")

    overseas_by_place: Dict[str, List[PhotoItem]] = {}

    for _, fm in _iter_photo_docs():
        description = fm.get("description")
        if not _is_overseas(description):
            continue

        place_key = _place_key_from_description(str(description))
        if not place_key:
            continue

        img = fm.get("img")
        if not img:
            # Skip items without an image.
            continue

        item = PhotoItem(
            title=str(fm.get("title") or place_key),
            img=_normalize_img(str(img)),
            date=_parse_date(fm.get("date")),
            description=str(description) if description else None,
            url=str(fm.get("permalink") or fm.get("url") or "") or None,
        )

        overseas_by_place.setdefault(place_key, []).append(item)

    # Geocode unique places
    session = requests.Session()
    session.headers.update({"User-Agent": NOMINATIM_UA})

    out_locations: List[Dict[str, Any]] = []

    for idx, (place, photos) in enumerate(sorted(overseas_by_place.items(), key=lambda kv: kv[0].lower())):
        # Rate limit: be polite (Nominatim recommends 1 req/sec)
        if idx > 0:
            time.sleep(1.1)

        coords = _nominatim_geocode(place, session=session)
        if not coords:
            print(f"[WARN] Could not geocode: {place}")
            continue

        lat, lng = coords
        out_locations.append(
            {
                "place": place,
                "lat": lat,
                "lng": lng,
                "photos": [
                    {
                        "title": p.title,
                        "img": p.img,
                        "date": p.date,
                        "description": p.description,
                        "url": p.url,
                    }
                    for p in sorted(photos, key=lambda p: (p.date or "", p.title))
                ],
            }
        )

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out_locations, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {len(out_locations)} locations -> {OUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
