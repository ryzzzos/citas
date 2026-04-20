from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import unicodedata

from geopy.exc import GeocoderServiceError, GeocoderTimedOut, GeocoderUnavailable
from geopy.geocoders import Nominatim

from app.core.config import settings

GEOCODING_STATUS_PENDING = "pending"
GEOCODING_STATUS_MANUAL = "manual"
GEOCODING_STATUS_SUCCESS = "success"
GEOCODING_STATUS_FAILED = "failed"


@dataclass
class GeocodingResult:
    latitude: float | None
    longitude: float | None
    status: str
    error: str | None = None


CITY_COORDINATE_FALLBACKS: dict[str, tuple[float, float]] = {
    "santiago": (-33.4489, -70.6693),
    "vina del mar": (-33.0245, -71.5518),
    "valparaiso": (-33.0472, -71.6127),
    "concepcion": (-36.8201, -73.0444),
    "temuco": (-38.7359, -72.5904),
    "antofagasta": (-23.6509, -70.3975),
    "la serena": (-29.9045, -71.2489),
    "rancagua": (-34.1708, -70.7400),
    "talca": (-35.4264, -71.6554),
    "puerto montt": (-41.4689, -72.9411),
    "medellin": (6.2442, -75.5812),
    "envigado": (6.1700, -75.5874),
    "bello": (6.3373, -75.5579),
    "itagui": (6.1719, -75.6114),
    "sabaneta": (6.1515, -75.6166),
    "la estrella": (6.1577, -75.6432),
    "rionegro": (6.1535, -75.3742),
    "copacabana": (6.3463, -75.5089),
}


def _normalize_city_name(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.strip().casefold())
    return "".join(char for char in normalized if not unicodedata.combining(char))


def _build_geocoding_queries(*, name: str, address: str, city: str) -> list[str]:
    candidates = [
        ", ".join(part.strip() for part in [address, city] if part and part.strip()),
        ", ".join(part.strip() for part in [address, city, name] if part and part.strip()),
        city.strip(),
    ]

    deduped: list[str] = []
    seen: set[str] = set()
    for candidate in candidates:
        if not candidate:
            continue
        key = candidate.casefold()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(candidate)
    return deduped


def _city_fallback(city: str, reason: str) -> GeocodingResult | None:
    fallback = CITY_COORDINATE_FALLBACKS.get(_normalize_city_name(city))
    if fallback is None:
        return None

    return GeocodingResult(
        latitude=fallback[0],
        longitude=fallback[1],
        status=GEOCODING_STATUS_SUCCESS,
        error=f"city_fallback:{reason}",
    )


@lru_cache(maxsize=1)
def _get_geolocator() -> Nominatim:
    return Nominatim(
        user_agent=settings.geocoding_user_agent,
        timeout=settings.geocoding_timeout_seconds,
    )


def geocode_business_location(*, name: str, address: str, city: str) -> GeocodingResult:
    queries = _build_geocoding_queries(name=name, address=address, city=city)
    if not queries:
        return GeocodingResult(
            latitude=None,
            longitude=None,
            status=GEOCODING_STATUS_PENDING,
            error="missing_address_query",
        )

    geolocator = _get_geolocator()

    for query in queries:
        try:
            location = geolocator.geocode(query, addressdetails=False, language="es")
        except (GeocoderTimedOut, GeocoderUnavailable, GeocoderServiceError) as exc:
            fallback_result = _city_fallback(city, reason=f"temporary_geocoding_error:{exc.__class__.__name__}")
            if fallback_result is not None:
                return fallback_result

            return GeocodingResult(
                latitude=None,
                longitude=None,
                status=GEOCODING_STATUS_FAILED,
                error=f"temporary_geocoding_error:{exc.__class__.__name__}",
            )
        except Exception as exc:  # pragma: no cover - defensive fallback
            fallback_result = _city_fallback(city, reason=f"unexpected_geocoding_error:{exc.__class__.__name__}")
            if fallback_result is not None:
                return fallback_result

            return GeocodingResult(
                latitude=None,
                longitude=None,
                status=GEOCODING_STATUS_FAILED,
                error=f"unexpected_geocoding_error:{exc.__class__.__name__}",
            )

        if location is None:
            continue

        return GeocodingResult(
            latitude=round(float(location.latitude), 6),
            longitude=round(float(location.longitude), 6),
            status=GEOCODING_STATUS_SUCCESS,
            error=None,
        )

    fallback_result = _city_fallback(city, reason="geocoding_no_results")
    if fallback_result is not None:
        return fallback_result

    return GeocodingResult(
        latitude=None,
        longitude=None,
        status=GEOCODING_STATUS_FAILED,
        error="geocoding_no_results",
    )
