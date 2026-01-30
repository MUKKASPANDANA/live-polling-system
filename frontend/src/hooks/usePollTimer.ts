import { useEffect, useState, useCallback } from 'react';

interface UsePollTimerReturn {
  remainingTime: number;
  isExpired: boolean;
  formattedTime: string;
}

export const usePollTimer = (
  startTime: string | Date | null,
  duration: number | null
): UsePollTimerReturn => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  const calculateRemainingTime = useCallback(() => {
    if (!startTime || duration === null) {
      return 0;
    }

    const now = new Date().getTime();
    const pollStartMs = new Date(startTime).getTime();
    const elapsedMs = now - pollStartMs;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, duration - elapsedSeconds);

    return remaining;
  }, [startTime, duration]);

  useEffect(() => {
    if (!startTime || duration === null) {
      return;
    }

    const remaining = calculateRemainingTime();
    setRemainingTime(remaining);
    setIsExpired(remaining === 0);

    // Update every 100ms for smooth countdown
    const interval = setInterval(() => {
      const newRemaining = calculateRemainingTime();
      setRemainingTime(newRemaining);
      setIsExpired(newRemaining === 0);

      if (newRemaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, calculateRemainingTime]);

  const formattedTime = `${Math.floor(remainingTime / 60)}:${String(remainingTime % 60).padStart(2, '0')}`;

  return {
    remainingTime,
    isExpired,
    formattedTime,
  };
};
