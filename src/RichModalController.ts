import type { PopupItemType } from './types';

export type RichModalPayload =
  | PopupItemType[]
  | {
      data: PopupItemType[];
      serverTime?: string | null;
    };

type RichModalHandler = (payload: RichModalPayload | null) => void;
export type RichModalControllerCommands = {
  show: (payload: RichModalPayload) => void;
  hide: () => void;
};

let handler: RichModalHandler | null = null;
let pendingPayload: RichModalPayload | null = null;

export const registerRichModalHandler = (nextHandler: RichModalHandler | null) => {
  handler = nextHandler;

  if (handler && pendingPayload) {
    const payload = pendingPayload;
    pendingPayload = null;
    handler(payload);
  }
};

const dispatchShow = (payload: RichModalPayload) => {
  if (handler) {
    handler(payload);
    return;
  }

  pendingPayload = payload;
};

const dispatchHide = () => {
  if (handler) {
    handler(null);
    return;
  }

  pendingPayload = null;
};

export const richModal: RichModalControllerCommands = {
  show: dispatchShow,
  hide: dispatchHide,
};
