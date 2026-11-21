import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoHideScroll(idleDelayMs = 900) {
  const [isScrolling, setIsScrolling] = useState(false);
  const timerRef = useRef<number | null>(null);

  const onScroll = useCallback(() => {
    setIsScrolling(true);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, idleDelayMs);
  }, [idleDelayMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isScrolling, onScroll };
}
