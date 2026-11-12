"""Interactive CLI command to create the sole initial portfolio administrator.

Usage (from `backend/`):
    python -m app.cli.create_admin
"""

from __future__ import annotations

import getpass
import sys

from pydantic import BaseModel, EmailStr, ValidationError

from app.core.config import get_settings
from app.core.exceptions import ConflictError
from app.db.session import close_db, get_session_factory
from app.services.auth import create_initial_admin


class _EmailCheck(BaseModel):
    email: EmailStr


def main() -> int:
    """Prompt locally for initial administrator credentials and store Argon2id hash."""
    settings = get_settings()
    session_factory = get_session_factory(settings)
    if session_factory is None:
        print(
            "Error: Database is not configured. Set DATABASE_URL or POSTGRES_* in backend/.env.",
            file=sys.stderr,
        )
        return 1

    try:
        raw_email = input("Administrator email: ").strip()
        try:
            validated_email = str(_EmailCheck(email=raw_email).email)
        except ValidationError:
            print("Error: Please provide a valid email address.", file=sys.stderr)
            return 1

        full_name = input("Administrator full name: ").strip()
        if len(full_name) < 2:
            print("Error: Full name must be at least 2 characters.", file=sys.stderr)
            return 1

        password = getpass.getpass("Password (min 12 characters): ")
        confirm_password = getpass.getpass("Confirm password: ")
        if password != confirm_password:
            print("Error: Passwords do not match.", file=sys.stderr)
            return 1

        with session_factory() as db:
            admin = create_initial_admin(
                db,
                email=validated_email,
                full_name=full_name,
                password=password,
            )
        print(f"Administrator account created for {admin.email} (id={admin.id}).")
        return 0
    except ConflictError as exc:
        print(f"Error: {exc.message}", file=sys.stderr)
        return 1
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nAborted.", file=sys.stderr)
        return 130
    finally:
        close_db()


if __name__ == "__main__":
    raise SystemExit(main())
