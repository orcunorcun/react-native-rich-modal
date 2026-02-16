import { CLOSE_BUTTON_SIZE, CONTENT_GAP, MODAL_MARGIN } from '../constants';
import {
  applyContentVisibility,
  buildPopupImageItems,
  calculateModalLayoutMetrics,
  getEligiblePopups,
  getLocalizedImageEntries,
  getLocalizedImageKeys,
  getLocalizedPopupContent,
  isRemoteUrl,
  resolveMessageForActiveImage,
  resolveTitleForActiveImage,
  resolveImageSourceByKey,
  resolvePopupSettings,
  type EligiblePopupContext,
  type PopupSettingDefaults,
} from '../richModal/helpers';

import type { PopupItemType } from '../types';

describe('resolvePopupSettings', () => {
  const defaults: PopupSettingDefaults = {
    fullscreenImage: false,
    fullscreenImageResizeMode: 'contain',
    panZoomEnabled: false,
    maxZoomScale: 3,
    closeOnBackdropPress: false,
    hideCloseButton: false,
  };

  it('uses popup-level overrides when provided', () => {
    const popup: PopupItemType = {
      id: 'popup-1',
      fullscreenImage: true,
      fullscreenImageResizeMode: 'cover',
      panZoomEnabled: true,
      maxZoomScale: 5,
      closeOnBackdropPress: true,
      hideCloseButton: true,
    };

    expect(resolvePopupSettings(popup, defaults)).toEqual({
      fullscreenImage: true,
      fullscreenImageResizeMode: 'cover',
      panZoomEnabled: true,
      maxZoomScale: 5,
      closeOnBackdropPress: true,
      hideCloseButton: true,
    });
  });

  it('falls back to global defaults when popup values are missing or invalid', () => {
    const popup: PopupItemType = {
      id: 'popup-2',
      fullscreenImage: null,
      fullscreenImageResizeMode: null,
      panZoomEnabled: null,
      maxZoomScale: 1,
      closeOnBackdropPress: null,
      hideCloseButton: null,
    };

    expect(resolvePopupSettings(popup, defaults)).toEqual(defaults);
  });
});

describe('applyContentVisibility', () => {
  it('hides image, title, and message based on global flags', () => {
    const input = {
      titleText: 'Title',
      messageText: 'Message',
      imageItems: [
        {
          key: 'img-1',
          source: 'a.jpg',
          placeholderPath: 'a.jpg',
          showPlaceholder: false,
          titleText: null,
          messageText: null,
        },
      ],
    };

    const result = applyContentVisibility({
      ...input,
      hideImage: true,
      hideTitle: true,
      hideMessage: false,
    });

    expect(result.titleText).toBeNull();
    expect(result.messageText).toBe('Message');
    expect(result.imageItems).toEqual([]);
  });
});

describe('getLocalizedImageKeys', () => {
  it('keeps explicit empty image entries as placeholder slots in arrays', () => {
    const keys = getLocalizedImageKeys([{ en: '' }, { en: 'https://cdn.example.com/image.jpg' }], 'en');

    expect(keys).toHaveLength(2);
    expect(keys[0]).toMatch(/^__missing_image__\d+$/);
    expect(keys[1]).toBe('https://cdn.example.com/image.jpg');
  });

  it('ignores localized objects that do not contain the active language key', () => {
    const keys = getLocalizedImageKeys([{ ja: 'popup/ja/1.jpg' }], 'en');
    expect(keys).toEqual([]);
  });

  it('extracts key from localized payload src', () => {
    const keys = getLocalizedImageKeys([{ en: { src: 'popup/en/1.jpg' } }], 'en');
    expect(keys).toEqual(['popup/en/1.jpg']);
  });
});

describe('getLocalizedImageEntries', () => {
  it('extracts image-level message when present', () => {
    const entries = getLocalizedImageEntries(
      [
        { en: 'popup/en/1.jpg', title: 'first title', message: 'test message' },
        { en: 'popup/en/2.jpg', title: { en: 'second title' }, message: { en: 'second' } },
      ],
      'en',
    );

    expect(entries).toEqual([
      { key: 'popup/en/1.jpg', titleText: 'first title', messageText: 'test message' },
      { key: 'popup/en/2.jpg', titleText: 'second title', messageText: 'second' },
    ]);
  });

  it('supports localized image payloads with per-language src/title/message', () => {
    const entries = getLocalizedImageEntries(
      [
        {
          en: { src: 'popup/en/1.jpg', title: 'EN title', message: 'EN message' },
          ja: { src: 'popup/ja/1.jpg', title: 'JA title', message: 'JA message' },
        },
      ],
      'ja',
    );

    expect(entries).toEqual([{ key: 'popup/ja/1.jpg', titleText: 'JA title', messageText: 'JA message' }]);
  });

  it('keeps explicit empty src in localized payload as placeholder slot', () => {
    const [entry] = getLocalizedImageEntries([{ en: { src: '' } }], 'en');
    expect(entry?.key).toMatch(/^__missing_image__\d+$/);
  });
});

describe('getLocalizedPopupContent', () => {
  it('uses direct string title/message for all languages', () => {
    const content = getLocalizedPopupContent(
      {
        id: 'string-content',
        title: 'Welcome',
        message: 'This is the simplest RichModal usage.',
      },
      'ja',
    );

    expect(content).toEqual({
      titleText: 'Welcome',
      messageText: 'This is the simplest RichModal usage.',
      linkUrl: null,
    });
  });

  it('supports localized url object by language', () => {
    const content = getLocalizedPopupContent(
      {
        id: 'localized-url',
        title: 'Welcome',
        message: 'Body',
        url: {
          en: 'https://example.com/en',
          ja: 'https://example.com/ja',
          cht: 'https://example.com/cht',
        },
      },
      'ja',
    );

    expect(content.linkUrl).toBe('https://example.com/ja');
  });

  it('keeps direct string url for all languages', () => {
    const content = getLocalizedPopupContent(
      {
        id: 'string-url',
        title: 'Welcome',
        message: 'Body',
        url: 'https://example.com/global',
      },
      'cht',
    );

    expect(content.linkUrl).toBe('https://example.com/global');
  });
});

describe('isRemoteUrl', () => {
  it('matches http/https case-insensitively with leading spaces', () => {
    expect(isRemoteUrl('   HTTPS://example.com/image.jpg')).toBe(true);
    expect(isRemoteUrl('http://example.com/image.jpg')).toBe(true);
  });

  it('returns false for non-http(s) keys', () => {
    expect(isRemoteUrl('file://local/path.jpg')).toBe(false);
    expect(isRemoteUrl('content://media/external/images/1')).toBe(false);
    expect(isRemoteUrl('data:image/png;base64,abcd')).toBe(false);
    expect(isRemoteUrl('popup/en/1.jpg')).toBe(false);
  });
});

describe('getEligiblePopups', () => {
  const now = new Date('2026-02-15T00:00:00.000Z');

  const baseContext: EligiblePopupContext = {
    langCode: 'en',
    appVersion: '1.2.3',
    hiddenInSessionSet: new Set<string>(),
    now,
    storage: {
      getBoolean: () => undefined,
    },
  };

  it('filters out hidden, storage-blocked and missing-content popups', () => {
    const storageBlockedContext: EligiblePopupContext = {
      ...baseContext,
      storage: {
        getBoolean: key => (key === 'storage-blocked' ? false : undefined),
      },
      hiddenInSessionSet: new Set(['hidden-session']),
    };

    const popups: PopupItemType[] = [
      {
        id: 'eligible',
        title: { en: 'Visible popup' },
      },
      {
        id: 'hidden-session',
        title: { en: 'Should hide' },
      },
      {
        id: 'storage-blocked',
        title: { en: 'Should hide' },
      },
      {
        id: 'missing-everything',
      },
      {
        id: 'missing-image-file',
        imgSrc: 'missing.jpg',
      },
    ];

    const eligible = getEligiblePopups(popups, storageBlockedContext);

    expect(eligible.map(popup => popup.id)).toEqual(['eligible', 'missing-image-file']);
  });

  it('keeps popup eligible when mixed URL + local keys are provided', () => {
    const mixedUrl = 'https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg';
    const popups: PopupItemType[] = [
      {
        id: 'theme-mixed',
        imgSrc: [{ en: mixedUrl }, { en: 'popup/en/2_2.jpg' }],
        title: { en: 'Theme Example' },
      },
    ];

    const eligible = getEligiblePopups(popups, baseContext);
    expect(eligible.map(popup => popup.id)).toEqual(['theme-mixed']);
  });
});

describe('buildPopupImageItems', () => {
  it('keeps missing images as placeholders instead of dropping them', () => {
    const items = buildPopupImageItems({
      imageEntries: [
        { key: 'valid.jpg', titleText: null, messageText: null },
        { key: 'missing.jpg', titleText: 'missing title', messageText: 'missing message' },
      ],
      resolveImageSource: key => (key === 'valid.jpg' ? `https://cdn.example.com/${key}` : null),
      imageFailedSet: new Set<string>(),
    });

    expect(items).toEqual([
      {
        key: 'valid.jpg',
        source: 'https://cdn.example.com/valid.jpg',
        placeholderPath: 'https://cdn.example.com/valid.jpg',
        showPlaceholder: false,
        titleText: null,
        messageText: null,
      },
      {
        key: 'missing.jpg',
        source: null,
        placeholderPath: 'missing.jpg',
        showPlaceholder: true,
        titleText: 'missing title',
        messageText: 'missing message',
      },
    ]);
  });

  it('shows placeholder when an image fails to load even if source exists', () => {
    const items = buildPopupImageItems({
      imageEntries: [{ key: 'valid.jpg', titleText: null, messageText: null }],
      resolveImageSource: key => `https://cdn.example.com/${key}`,
      imageFailedSet: new Set<string>(['valid.jpg']),
    });

    expect(items).toEqual([
      {
        key: 'valid.jpg',
        source: 'https://cdn.example.com/valid.jpg',
        placeholderPath: 'https://cdn.example.com/valid.jpg',
        showPlaceholder: true,
        titleText: null,
        messageText: null,
      },
    ]);
  });

  it('treats numeric image sources as valid items', () => {
    const items = buildPopupImageItems({
      imageEntries: [{ key: 'local.jpg', titleText: null, messageText: null }],
      resolveImageSource: () => 123,
      imageFailedSet: new Set<string>(),
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      key: 'local.jpg',
      source: 123,
      showPlaceholder: false,
      titleText: null,
      messageText: null,
    });
  });

  it('keeps placeholder path empty for explicit empty slots', () => {
    const [missingKey] = getLocalizedImageKeys([{ en: '' }], 'en');
    const items = buildPopupImageItems({
      imageEntries: [{ key: missingKey!, titleText: null, messageText: null }],
      resolveImageSource: () => null,
      imageFailedSet: new Set<string>(),
    });

    expect(items).toEqual([
      {
        key: missingKey,
        source: null,
        placeholderPath: '',
        showPlaceholder: true,
        titleText: null,
        messageText: null,
      },
    ]);
  });
});

describe('resolveMessageForActiveImage', () => {
  it('uses image-level message for active slide when present', () => {
    expect(
      resolveMessageForActiveImage({
        messageText: 'fallback',
        activeImageIndex: 1,
        imageItems: [
          {
            key: '1',
            source: '1.jpg',
            placeholderPath: '1.jpg',
            showPlaceholder: false,
            titleText: null,
            messageText: null,
          },
          {
            key: '2',
            source: '2.jpg',
            placeholderPath: '2.jpg',
            showPlaceholder: false,
            titleText: null,
            messageText: 'slide 2',
          },
        ],
      }),
    ).toBe('slide 2');
  });

  it('falls back to popup message when active image has no message', () => {
    expect(
      resolveMessageForActiveImage({
        messageText: 'fallback',
        activeImageIndex: 0,
        imageItems: [
          {
            key: '1',
            source: '1.jpg',
            placeholderPath: '1.jpg',
            showPlaceholder: false,
            titleText: null,
            messageText: null,
          },
        ],
      }),
    ).toBe('fallback');
  });

  it('does not override when allowOverride is false', () => {
    expect(
      resolveMessageForActiveImage({
        messageText: 'fallback',
        activeImageIndex: 0,
        allowOverride: false,
        imageItems: [
          {
            key: '1',
            source: '1.jpg',
            placeholderPath: '1.jpg',
            showPlaceholder: false,
            titleText: null,
            messageText: 'slide message',
          },
        ],
      }),
    ).toBe('fallback');
  });
});

describe('resolveTitleForActiveImage', () => {
  it('uses image-level title for active slide when present', () => {
    expect(
      resolveTitleForActiveImage({
        titleText: 'fallback title',
        activeImageIndex: 1,
        imageItems: [
          {
            key: '1',
            source: '1.jpg',
            placeholderPath: '1.jpg',
            showPlaceholder: false,
            titleText: null,
            messageText: null,
          },
          {
            key: '2',
            source: '2.jpg',
            placeholderPath: '2.jpg',
            showPlaceholder: false,
            titleText: 'slide 2 title',
            messageText: null,
          },
        ],
      }),
    ).toBe('slide 2 title');
  });

  it('falls back to popup title when active image has no title', () => {
    expect(
      resolveTitleForActiveImage({
        titleText: 'fallback title',
        activeImageIndex: 0,
        imageItems: [
          {
            key: '1',
            source: '1.jpg',
            placeholderPath: '1.jpg',
            showPlaceholder: false,
            titleText: null,
            messageText: null,
          },
        ],
      }),
    ).toBe('fallback title');
  });

  it('does not override when allowOverride is false', () => {
    expect(
      resolveTitleForActiveImage({
        titleText: 'fallback title',
        activeImageIndex: 0,
        allowOverride: false,
        imageItems: [
          {
            key: '1',
            source: '1.jpg',
            placeholderPath: '1.jpg',
            showPlaceholder: false,
            titleText: 'slide title',
            messageText: null,
          },
        ],
      }),
    ).toBe('fallback title');
  });
});

describe('resolveImageSourceByKey', () => {
  it('returns resolver output when resolver finds an image', () => {
    const resolver = jest.fn(() => 123);

    expect(
      resolveImageSourceByKey({
        key: 'popup/en/2_2.jpg',
        resolveImage: resolver,
        imageBase: 'https://cdn.example.com',
      }),
    ).toBe(123);
    expect(resolver).toHaveBeenCalledWith('popup/en/2_2.jpg');
  });

  it('accepts zero-like resolver outputs as valid when not nullish', () => {
    const resolver = jest.fn(() => 0);

    expect(
      resolveImageSourceByKey({
        key: 'popup/en/2_2.jpg',
        resolveImage: resolver,
        imageBase: 'https://cdn.example.com',
      }),
    ).toBe(0);
    expect(resolver).toHaveBeenCalledWith('popup/en/2_2.jpg');
  });

  it('falls back to direct URL when resolver misses', () => {
    const resolver = jest.fn(() => null);
    const url = 'https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg';

    expect(
      resolveImageSourceByKey({
        key: url,
        resolveImage: resolver,
        imageBase: 'https://cdn.example.com',
      }),
    ).toBe(url);
    expect(resolver).toHaveBeenCalledWith(url);
  });

  it('does not use imageBase when resolver exists and key is not a URL', () => {
    const resolver = jest.fn(() => null);

    expect(
      resolveImageSourceByKey({
        key: 'popup/en/2_2.jpg',
        resolveImage: resolver,
        imageBase: 'https://cdn.example.com',
      }),
    ).toBeNull();
    expect(resolver).toHaveBeenCalledWith('popup/en/2_2.jpg');
  });

  it('uses imageBase for non-URL keys when resolver is absent', () => {
    expect(
      resolveImageSourceByKey({
        key: 'popup/en/2_2.jpg',
        imageBase: 'https://cdn.example.com',
      }),
    ).toBe('https://cdn.example.com/popup/en/2_2.jpg');
  });
});

describe('calculateModalLayoutMetrics', () => {
  it('uses close button height in non-fullscreen fixed space calculation', () => {
    const metrics = calculateModalLayoutMetrics({
      windowWidth: 400,
      windowHeight: 800,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      isFullscreenImageMode: false,
      fullscreenImageResizeMode: 'contain',
      hasImage: true,
      hasText: false,
      titleText: null,
      messageText: null,
      imageItems: [
        {
          key: 'img-1',
          source: 'x.jpg',
          placeholderPath: 'x.jpg',
          showPlaceholder: false,
          titleText: null,
          messageText: null,
        },
      ],
      imageAspectRatios: { 'img-1': 1 },
      activeImageIndex: 0,
      hasImageDots: false,
      hasDontShowAgainToggle: false,
    });

    const expectedFixedVerticalSpace = CLOSE_BUTTON_SIZE + CONTENT_GAP + MODAL_MARGIN * 2;
    const expectedMaxImageHeight = 800 - expectedFixedVerticalSpace;

    expect(metrics.maxImageHeight).toBe(expectedMaxImageHeight);
    expect(metrics.contentWidth).toBe(400 - MODAL_MARGIN * 2);
  });
});
