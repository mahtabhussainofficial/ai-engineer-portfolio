"""Thread-safe in-memory sliding-window rate limiter for authentication endpoints."""

from __future__ import annotations

import math
import threading
import time
from collections import deque


class SlidingWindowRateLimiter:
    """Tracks failed attempts per key over a rolling time window."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._attempts: dict[str, deque[float]] = {}

    def _prune(self, bucket: deque[float], cutoff: float) -> None:
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

    def check(self, key: str, *, max_attempts: int, window_seconds: int) -> int | None:
        """Return retry-after seconds if rate limit is exceeded, else None."""
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            bucket = self._attempts.get(key)
            if not bucket:
                return None
            self._prune(bucket, cutoff)
            if not bucket:
                del self._attempts[key]
                return None
            if len(bucket) >= max_attempts:
                retry_after = math.ceil(bucket[0] + window_seconds - now)
                return max(1, retry_after)
            return None

    def record_failure(self, key: str, *, window_seconds: int) -> None:
        """Record a failed attempt timestamp for the given key."""
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            bucket = self._attempts.setdefault(key, deque())
            self._prune(bucket, cutoff)
            bucket.append(now)

    def reset(self, key: str) -> None:
        """Clear recorded failures for a specific key."""
        with self._lock:
            self._attempts.pop(key, None)

    def clear(self) -> None:
        """Clear all rate-limiter buckets (primarily for test isolation)."""
        with self._lock:
            self._attempts.clear()


login_rate_limiter = SlidingWindowRateLimiter()
