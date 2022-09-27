import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { showCountTime } from '../utils/date';

const useCountDownTime = (from = 0, to = 0, onStop = () => {}) => {
  const [count, setCount] = useState(from);
  const intervalRef = useRef();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    onStop();
  }, [onStop]);

  const start = useCallback(() => {
    if (from === start) return;
    intervalRef.current = setInterval(() => {
      setCount(preCount => {
        const newCount = preCount - 1;
        if (newCount === to) stop();
        if (newCount >= to) return newCount;
        else return preCount;
      });
    }, 1000);
  }, [from, stop, to]);

  const reset = useCallback((_from) => {
    clearInterval(intervalRef.current);
    setCount(_from || from);
  }, [from]);

  const showCount = useMemo(() => showCountTime(count), [count]);

  return { count, showCount, start, reset, stop };
};

export default useCountDownTime;
