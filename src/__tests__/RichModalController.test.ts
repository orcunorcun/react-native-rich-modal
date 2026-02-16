import { registerRichModalHandler, richModal, type RichModalPayload } from '../RichModalController';

import type { PopupItemType } from '../types';

const SAMPLE_POPUP: PopupItemType = {
  id: 'test-popup',
  title: { en: 'Test popup' },
};

describe('RichModalController', () => {
  beforeEach(() => {
    registerRichModalHandler(null);
    richModal.hide();
  });

  afterEach(() => {
    registerRichModalHandler(null);
    richModal.hide();
  });

  it('queues payload until a handler is registered', () => {
    const handler = jest.fn<void, [RichModalPayload | null]>();

    richModal.show([SAMPLE_POPUP]);
    expect(handler).not.toHaveBeenCalled();

    registerRichModalHandler(handler);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith([SAMPLE_POPUP]);
  });

  it('forwards payload immediately when handler exists', () => {
    const handler = jest.fn<void, [RichModalPayload | null]>();
    registerRichModalHandler(handler);

    richModal.show([SAMPLE_POPUP]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith([SAMPLE_POPUP]);
  });

  it('clears pending payload when hide is called before registration', () => {
    const handler = jest.fn<void, [RichModalPayload | null]>();

    richModal.show([SAMPLE_POPUP]);
    richModal.hide();
    registerRichModalHandler(handler);

    expect(handler).not.toHaveBeenCalled();
  });

  it('sends null to handler when hide is called after registration', () => {
    const handler = jest.fn<void, [RichModalPayload | null]>();
    registerRichModalHandler(handler);

    richModal.hide();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(null);
  });

  it('supports richModal.show and richModal.hide commands', () => {
    const handler = jest.fn<void, [RichModalPayload | null]>();
    registerRichModalHandler(handler);

    richModal.show([SAMPLE_POPUP]);
    richModal.hide();

    expect(handler).toHaveBeenNthCalledWith(1, [SAMPLE_POPUP]);
    expect(handler).toHaveBeenNthCalledWith(2, null);
  });
});
