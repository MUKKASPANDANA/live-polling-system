/**
 * Calculate remaining time for a poll
 * @param startTime - The time when the poll started
 * @param duration - The total duration in seconds
 * @returns Remaining time in seconds (minimum 0)
 */
export const getRemainingTime = (startTime: Date, duration: number): number => {
  const now = new Date().getTime();
  const pollStartMs = new Date(startTime).getTime();
  const elapsedMs = now - pollStartMs;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const remaining = Math.max(0, duration - elapsedSeconds);
  return remaining;
};

/**
 * Check if a poll has timed out
 * @param startTime - The time when the poll started
 * @param duration - The total duration in seconds
 * @returns true if the poll has expired
 */
export const isPollExpired = (startTime: Date, duration: number): boolean => {
  return getRemainingTime(startTime, duration) === 0;
};
