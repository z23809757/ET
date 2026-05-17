import { useCallback, useRef } from 'react';
import { debounce } from 'debounce';

export function useDebouncedSave<T>(
  saveFn: (data: T) => Promise<void>, 
  delay: number = 500
) {
  const isSavingRef = useRef(false);
  const pendingDataRef = useRef<T | null>(null);

  const debouncedSave = useCallback(
    debounce(async (data: T) => {
      pendingDataRef.current = data;
      
      if (isSavingRef.current) return;
      
      isSavingRef.current = true;
      try {
        if (pendingDataRef.current) {
          await saveFn(pendingDataRef.current);
          pendingDataRef.current = null;
        }
      } finally {
        isSavingRef.current = false;
      }
    }, delay),
    [saveFn, delay]
  );

  return debouncedSave;
}