"""Custom PostgreSQL-native column types with SQLite test compatibility."""

from __future__ import annotations

from sqlalchemy import JSON, String, Text
from sqlalchemy.dialects import postgresql

# Uses native JSONB in PostgreSQL and JSON in SQLite for lightweight unit tests.
JSONBType = JSON().with_variant(postgresql.JSONB(astext_type=Text()), "postgresql")


def string_array_type(item_length: int = 120):
    """Return a PostgreSQL VARCHAR[] column type with JSON fallback for SQLite tests."""
    return postgresql.ARRAY(String(item_length)).with_variant(JSON(), "sqlite")


def text_array_type():
    """Return a PostgreSQL TEXT[] column type with JSON fallback for SQLite tests."""
    return postgresql.ARRAY(Text()).with_variant(JSON(), "sqlite")
