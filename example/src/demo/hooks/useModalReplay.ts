import { useCallback, useMemo, useState } from 'react';

export const useModalReplay = (prefix: string) => {
  // Keep modal inactive by default; user explicitly starts flow via replay.
  const [instance, setInstance] = useState(0);
  const [visible, setVisible] = useState(false);

  const replay = useCallback(() => {
    setVisible(true);
    setInstance(prev => prev + 1);
  }, []);

  const modalKey = useMemo(() => `${prefix}-${instance}`, [prefix, instance]);

  return {
    replay,
    modalKey,
    visible,
  };
};
