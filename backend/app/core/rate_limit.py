"""Thread-safe, bounded single-process sliding-window rate limiter."""

from __future__ import annotations

import math
import threading
import time
from collections import deque


class SlidingWindowRateLimiter:
    """Tracks attempt timestamps per key over a rolling window with bounded memory.

    Intended for single-worker/single-instance deployments; horizontal scaling across
    multiple worker processes or nodes requires a shared backend (e.g. Redis).
    """

    def __init__(self, *, max_keys: int = 10_000) -> None:
        if max_keys < 1:
            raise ValueError("max_keys must be at least 1.")
        self._max_keys = max_keys
        self._lock = threading.Lock()
        self._attempts: dict[str, deque[float]] = {}
        self._expirations: dict[str, float] = {}

    def _prune(self, bucket: deque[float], cutoff: float) -> None:
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

    def _evict_stale_or_oldest(self, now: float) -> None:
        expired_keys = [
            key
            for key, expires_at in self._expirations.items()
            if expires_at <= now
        ]
        for key in expired_keys:
            self._attempts.pop(key, None)
            self._expirations.pop(key, None)

        while len(self._attempts) >= self._max_keys:
            oldest_key = next(iter(self._attempts))
            self._attempts.pop(oldest_key, None)
            self._expirations.pop(oldest_key, None)

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
                self._attempts.pop(key, None)
                self._expirations.pop(key, None)
                return None
            if len(bucket) >= max_attempts:
                retry_after = math.ceil(bucket[0] + window_seconds - now)
                return max(1, retry_after)
            return None

    def record(self, key: str, *, window_seconds: int) -> None:
        """Record an event timestamp for the given key within the sliding window."""
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            bucket = self._attempts.pop(key, None)
            if bucket is None:
                if len(self._attempts) >= self._max_keys:
                    self._evict_stale_or_oldest(now)
                bucket = deque()
            self._prune(bucket, cutoff)
            bucket.append(now)
            # Re-insert so dict iteration order tracks most-recently-active keys.
            self._attempts[key] = bucket
            self._expirations[key] = now + window_seconds

    def record_failure(self, key: str, *, window_seconds: int) -> None:
        """Record a failed attempt timestamp for the given key."""
        self.record(key, window_seconds=window_seconds)

    def reset(self, key: str) -> None:
        """Clear recorded failures for a specific key."""
        with self._lock:
            self._attempts.pop(key, None)
            self._expirations.pop(key, None)

    def clear(self) -> None:
        """Clear all rate-limiter buckets (primarily for test isolation)."""
        with self._lock:
            self._attempts.clear()
            self._expirations.clear()


login_rate_limiter = SlidingWindowRateLimiter()
contact_rate_limiter = SlidingWindowRateLimiter()
