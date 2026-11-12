"""CLI command for safe, idempotent portfolio content discovery import.

Usage (from `backend/`):
    python -m app.cli.import_content --dry-run
    python -m app.cli.import_content --apply
"""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence

from app.core.config import get_settings
from app.db.session import close_db, get_session_factory
from app.services.seeding.importer import ImportReport, import_portfolio_content


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import initial portfolio content from Next.js static catalog into PostgreSQL.",
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Validate and report planned actions without writing to the database (default).",
    )
    mode.add_argument(
        "--apply",
        action="store_true",
        help="Persist validated missing records to the database.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the import report as formatted JSON.",
    )
    return parser


def _print_text_report(report: ImportReport) -> None:
    mode_label = "DRY-RUN (zero DB writes)" if report.dry_run else "APPLIED"
    print(f"Portfolio Content Import [{mode_label}]")
    print(
        f"Totals -> created={report.created}, skipped={report.skipped}, "
        f"updated={report.updated}, rejected={report.rejected}"
    )
    print("\nBy Entity:")
    for entity_type, counts in report.by_entity.items():
        print(
            f"  - {entity_type}: created={counts.created}, skipped={counts.skipped}, "
            f"updated={counts.updated}, rejected={counts.rejected}"
        )

    print("\nItem Details:")
    for item in report.items:
        status_suffix = f" [{item.status_label}]" if item.status_label else ""
        reason_suffix = f" -> {item.reason}" if item.reason else ""
        print(
            f"  [{item.action.upper()}] {item.entity_type}: "
            f"{item.identifier}{status_suffix}{reason_suffix}"
        )


def main(argv: Sequence[str] | None = None) -> int:
    args = _build_parser().parse_args(list(argv) if argv is not None else None)
    dry_run = not bool(args.apply)

    settings = get_settings()
    session_factory = get_session_factory(settings)
    if session_factory is None:
        print(
            "Error: Database is not configured. Set DATABASE_URL or POSTGRES_* in backend/.env.",
            file=sys.stderr,
        )
        return 1

    try:
        with session_factory() as db:
            report = import_portfolio_content(db, dry_run=dry_run)
        if args.json:
            print(json.dumps(report.to_dict(), indent=2))
        else:
            _print_text_report(report)
        return 2 if report.rejected > 0 else 0
    except Exception as exc:  # pragma: no cover - defensive CLI barrier
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    finally:
        close_db()


if __name__ == "__main__":
    raise SystemExit(main())
