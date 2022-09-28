import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { showCountTime } from '../utils/date';

const useCountTime = (from = 0, to = 0, onStop = () => {}) => {
  const [count, setCount] = useState(from);
  const [isCounting, setIsCounting] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []);

  const stop = useCallback((notCallOnStop) => {
    clearInterval(intervalRef.current);
    setIsCounting(false);
    if (!notCallOnStop) onStop();
  }, [onStop]);

  const start = useCallback(() => {
    setIsCounting(true);
    setCount(from);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCount(preCount => {
        const newCount = preCount + 1;
        if (newCount === to) stop();
        if (newCount <= to) return newCount;
        else return preCount;
      });
    }, 1000);
  }, [from, stop, to]);

  const reset = useCallback(() => {
    setIsCounting(false);
    clearInterval(intervalRef.current);
    setCount(from);
  }, [from]);

  const showCount = useMemo(() => showCountTime(count), [count]);

  return { isCounting, count, showCount, start, reset, stop };
};

export default useCountTime;
