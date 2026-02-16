import { useCallback, useMemo, useRef, useState } from 'react';

import type { RichModalStorage } from 'react-native-rich-modal';

export const useMemoryStorage = () => {
  // Demo-friendly storage adapter: keeps values in memory and exposes a snapshot for the UI.
  const cacheRef = useRef<Record<string, boolean>>({});
  const [snapshot, setSnapshot] = useState<Record<string, boolean>>({});

  const storage = useMemo<RichModalStorage>(
    () => ({
      getBoolean: (key: string) => cacheRef.current[key],
      set: (key: string, value: boolean) => {
        cacheRef.current = {
          ...cacheRef.current,
          [key]: value,
        };
        setSnapshot({ ...cacheRef.current });
      },
    }),
    [],
  );

  const reset = useCallback(() => {
    cacheRef.current = {};
    setSnapshot({});
  }, []);

  return {
    storage,
    reset,
    snapshot,
  };
};
