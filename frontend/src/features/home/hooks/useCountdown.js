import { useEffect, useState } from "react";

const EMPTY_COUNTDOWN = {
  hours: "00",
  minutes: "00",
  seconds: "00",
};

function pad(value) {
  return String(Math.max(value, 0)).padStart(2, "0");
}

function getCountdown(targetDate) {
  const targetTime = targetDate instanceof Date ? targetDate.getTime() : new Date(targetDate).getTime();
  const difference = targetTime - Date.now();

  if (!Number.isFinite(targetTime) || difference <= 0) return EMPTY_COUNTDOWN;

  return {
    hours: pad(Math.floor((difference / (1000 * 60 * 60)) % 24)),
    minutes: pad(Math.floor((difference / (1000 * 60)) % 60)),
    seconds: pad(Math.floor((difference / 1000) % 60)),
  };
}

export function useCountdown(targetDate) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    setCountdown(getCountdown(targetDate));

    const intervalId = window.setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [targetDate]);

  return countdown;
}

export default useCountdown;
