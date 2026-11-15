// November is standard time in Stockholm (CET, UTC+01:00).
// The explicit offset makes the reveal independent of the visitor's timezone.
export const REVEAL_AT = Date.parse('2026-11-21T15:00:00+01:00');

export function getCountdown(now = Date.now()) {
  const remaining = Math.max(0, REVEAL_AT - now);
  const seconds = Math.ceil(remaining / 1000);
  return {
    unlocked: remaining === 0,
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
}
