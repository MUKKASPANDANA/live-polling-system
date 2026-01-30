"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPollExpired = exports.getRemainingTime = void 0;
/**
 * Calculate remaining time for a poll
 * @param startTime - The time when the poll started
 * @param duration - The total duration in seconds
 * @returns Remaining time in seconds (minimum 0)
 */
const getRemainingTime = (startTime, duration) => {
    const now = new Date().getTime();
    const pollStartMs = new Date(startTime).getTime();
    const elapsedMs = now - pollStartMs;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, duration - elapsedSeconds);
    return remaining;
};
exports.getRemainingTime = getRemainingTime;
/**
 * Check if a poll has timed out
 * @param startTime - The time when the poll started
 * @param duration - The total duration in seconds
 * @returns true if the poll has expired
 */
const isPollExpired = (startTime, duration) => {
    return (0, exports.getRemainingTime)(startTime, duration) === 0;
};
exports.isPollExpired = isPollExpired;
