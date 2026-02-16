import React, { useEffect, useState } from 'react';

import RichModal from './RichModal';
import { registerRichModalHandler } from './RichModalController';

import type { RichModalProps } from './RichModal';
import type { RichModalPayload } from './RichModalController';

type RichModalProviderProps = Omit<RichModalProps, 'popups' | 'serverTime' | 'visible'> & {
  children: React.ReactNode;
};

const RichModalProvider = ({ children, ...modalProps }: RichModalProviderProps) => {
  const [popups, setPopups] = useState<RichModalProps['popups']>([]);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (payload: RichModalPayload | null) => {
      if (!payload) {
        setVisible(false);
        setPopups([]);
        setServerTime(null);
        return;
      }

      if (Array.isArray(payload)) {
        setPopups(payload);
        setServerTime(null);
      } else {
        const data = Array.isArray(payload.data) ? payload.data : [];
        setPopups(data);
        setServerTime(payload.serverTime ?? null);
      }

      setVisible(true);
    };

    registerRichModalHandler(handler);

    return () => {
      registerRichModalHandler(null);
    };
  }, []);

  return (
    <>
      {children}
      <RichModal popups={popups} serverTime={serverTime} visible={visible} {...modalProps} />
    </>
  );
};

export default RichModalProvider;
