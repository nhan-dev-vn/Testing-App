import React, { useMemo, useState, useRef, useCallback } from 'react';
import { showCountTime } from '../utils/date';

const useCountDownTime = (from = 0, to = 0, onStop = () => {}) => {
  const [count, setCount] = useState(from);
  const intervalRef = useRef();

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    onStop();
  }, [onStop]);

  const start = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCount(preCount => {
        const newCount = preCount - 1;
        if (newCount === to) stop();
        if (newCount >= to) return newCount;
        else return preCount;
      });
    }, 1000);
  }, [stop, to]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setCount(from);
  }, [from]);

  const showCount = useMemo(() => showCountTime(count), [count]);

  return { count, showCount, start, reset, stop };
};

export default useCountDownTime;
