import { Image } from 'react-native';

import {
  CAROUSEL_DOTS_HEIGHT,
  CHECK_ROW_HEIGHT,
  CLOSE_BUTTON_SIZE,
  CONTENT_GAP,
  DEFAULT_ASPECT_RATIO,
  MODAL_MARGIN,
  TEXT_SECTION_PADDING,
} from '../constants';
import { isWithinDateRange, isWithinVersionRange, normalizeNonEmptyString } from '../utils/filtering';

import type { LocalizedText, PopupImageResizeMode, PopupItemType } from '../types';

export type ModalImageSource = string | number | null;

export type PopupImageItem = {
  key: string;
  source: ModalImageSource;
  placeholderPath: string;
  showPlaceholder: boolean;
  titleText: string | null;
  messageText: string | null;
};

export type LocalizedImageEntry = {
  key: string;
  titleText: string | null;
  messageText: string | null;
};

export type ModalInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ModalImageSize = {
  width: number;
  height: number;
};

export type LocalizedPopupContent = {
  titleText: string | null;
  messageText: string | null;
  linkUrl: string | null;
};

export type EligiblePopupContext = {
  langCode: string;
  appVersion?: string;
  hiddenInSessionSet: Set<string>;
  now: Date;
  storage?: {
    getBoolean: (key: string) => boolean | undefined;
  };
};

export type LayoutMetricsInput = {
  windowWidth: number;
  windowHeight: number;
  insets: ModalInsets;
  isFullscreenImageMode: boolean;
  fullscreenImageResizeMode: PopupImageResizeMode;
  hasImage: boolean;
  hasText: boolean;
  titleText: string | null;
  messageText: string | null;
  imageItems: PopupImageItem[];
  imageAspectRatios: Record<string, number>;
  activeImageIndex: number;
  hasImageDots: boolean;
  hasDontShowAgainToggle: boolean;
};

export type LayoutMetrics = {
  contentWidth: number;
  maxImageHeight: number;
  maxTextHeight: number;
  fallbackAspectRatio: number;
  imageSizes: Record<string, ModalImageSize>;
  activeImageSize: ModalImageSize;
  isActiveImageRatioKnown: boolean;
};

export type FullscreenOverlayOffsets = {
  closeTop: number;
  closeRight: number;
  checkRowBottom: number;
  dotsBottom: number;
  textBottom: number;
};

export type PopupSettingDefaults = {
  fullscreenImage: boolean;
  fullscreenImageResizeMode: PopupImageResizeMode;
  panZoomEnabled: boolean;
  maxZoomScale: number;
  closeOnBackdropPress: boolean;
  hideCloseButton: boolean;
};

export type PopupResolvedSettings = {
  fullscreenImage: boolean;
  fullscreenImageResizeMode: PopupImageResizeMode;
  panZoomEnabled: boolean;
  maxZoomScale: number;
  closeOnBackdropPress: boolean;
  hideCloseButton: boolean;
};

export type RichModalResolvedTestIDs = {
  modal: string;
  backdrop: string;
  container: string;
  content: string;
  closeButton: string;
  checkboxRow: string;
  checkboxLabel: string;
  title: string;
  message: string;
  carousel: string;
  carouselItemPrefix: string;
  carouselDotPrefix: string;
  imagePrefix: string;
  placeholderPrefix: string;
};

export const ASPECT_RATIO_EPSILON = 0.0001;
export const FULLSCREEN_OVERLAY_INSET = 12;
export const FULLSCREEN_TEXT_MAX_HEIGHT_RATIO = 0.45;
export const DEFAULT_MAX_ZOOM_SCALE = 3;
export const DEFAULT_TEST_ID_PREFIX = 'rich-modal';

const DEFAULT_MODAL_INSETS: ModalInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
const ZERO_SIZE: ModalImageSize = { width: 0, height: 0 };
const TITLE_LINE_HEIGHT = 20;
const MESSAGE_LINE_HEIGHT = 18;
const TITLE_MESSAGE_GAP = 8;
const MISSING_IMAGE_KEY_PREFIX = '__missing_image__';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const normalizeString = normalizeNonEmptyString;
export const normalizeInsetValue = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(value, 0) : 0;
export const normalizeOpacity = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : fallback;
export const normalizeImageResizeMode = (value: PopupImageResizeMode | null | undefined): PopupImageResizeMode =>
  value === 'cover' ? 'cover' : 'contain';
export const normalizeMaxZoomScale = (value: number | null | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 1 ? value : fallback;
export const buildIndexedTestID = (prefix: string, index: number): string => `${prefix}-${index}`;
export const resolveRichModalTestIDs = (prefixValue?: string | null): RichModalResolvedTestIDs => {
  const prefix = normalizeString(prefixValue) ?? DEFAULT_TEST_ID_PREFIX;

  return {
    modal: prefix,
    backdrop: `${prefix}-backdrop`,
    container: `${prefix}-container`,
    content: `${prefix}-content`,
    closeButton: `${prefix}-close-button`,
    checkboxRow: `${prefix}-checkbox-row`,
    checkboxLabel: `${prefix}-checkbox-label`,
    title: `${prefix}-title`,
    message: `${prefix}-message`,
    carousel: `${prefix}-carousel`,
    carouselItemPrefix: `${prefix}-carousel-item`,
    carouselDotPrefix: `${prefix}-carousel-dot`,
    imagePrefix: `${prefix}-image`,
    placeholderPrefix: `${prefix}-placeholder`,
  };
};

export const getFullscreenOverlayOffsets = ({
  hasImageDots,
  hasDontShowAgainToggle,
}: {
  hasImageDots: boolean;
  hasDontShowAgainToggle: boolean;
}): FullscreenOverlayOffsets => {
  const checkRowBottom = FULLSCREEN_OVERLAY_INSET;
  const dotsBottom = checkRowBottom + (hasDontShowAgainToggle ? CHECK_ROW_HEIGHT + CONTENT_GAP : 0);
  const textBottom = dotsBottom + (hasImageDots ? CAROUSEL_DOTS_HEIGHT : 0) + CONTENT_GAP;

  return {
    closeTop: FULLSCREEN_OVERLAY_INSET,
    closeRight: FULLSCREEN_OVERLAY_INSET,
    checkRowBottom,
    dotsBottom,
    textBottom,
  };
};

export const resolveInsets = (value?: Partial<ModalInsets> | null): ModalInsets => {
  if (!value) {
    return DEFAULT_MODAL_INSETS;
  }

  return {
    top: normalizeInsetValue(value.top),
    right: normalizeInsetValue(value.right),
    bottom: normalizeInsetValue(value.bottom),
    left: normalizeInsetValue(value.left),
  };
};

export const getPopupId = (item?: PopupItemType | null): string | null => normalizeString(item?.id);

export const getLocalizedValue = (
  value: LocalizedText | string | null | undefined,
  langCode: string,
): string | null => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return normalizeString(value);
  }
  if (isRecord(value)) {
    return normalizeString((value as Record<string, string | null | undefined>)[langCode]);
  }
  return null;
};

export const getLocalizedImageKeys = (value: PopupItemType['imgSrc'], langCode: string): string[] => {
  return getLocalizedImageEntries(value, langCode).map(item => item.key);
};

export const getLocalizedImageEntries = (value: PopupItemType['imgSrc'], langCode: string): LocalizedImageEntry[] => {
  if (!value) {
    return [];
  }

  const createMissingImageKey = (index: number) => `${MISSING_IMAGE_KEY_PREFIX}${index}`;
  const isExplicitEmptyString = (entry: unknown): entry is string =>
    typeof entry === 'string' && entry.trim().length === 0;
  const extractKey = (entry: unknown, index: number): string | null => {
    if (!entry) {
      return null;
    }
    if (typeof entry === 'string') {
      const normalized = normalizeString(entry);
      if (normalized) {
        return normalized;
      }
      return isExplicitEmptyString(entry) ? createMissingImageKey(index) : null;
    }
    if (isRecord(entry)) {
      const localized = (entry as Record<string, string | null | undefined>)[langCode];
      if (localized === undefined) {
        return null;
      }

      const normalized = normalizeString(localized);
      if (normalized) {
        return normalized;
      }
      return isExplicitEmptyString(localized) ? createMissingImageKey(index) : null;
    }
    return null;
  };

  const extractLocalizedPayload = (
    localizedPayloadValue: unknown,
    index: number,
  ): { key: string | null; titleText: string | null; messageText: string | null } => {
    if (!isRecord(localizedPayloadValue)) {
      return { key: null, titleText: null, messageText: null };
    }

    const rawSrc = localizedPayloadValue.src;
    const normalizedSrc = typeof rawSrc === 'string' ? normalizeString(rawSrc) : null;
    const isExplicitEmptySrc = typeof rawSrc === 'string' && rawSrc.trim().length === 0;
    const key = normalizedSrc ?? (isExplicitEmptySrc ? createMissingImageKey(index) : null);

    const titleText =
      typeof localizedPayloadValue.title === 'string' ? normalizeString(localizedPayloadValue.title) : null;
    const messageText =
      typeof localizedPayloadValue.message === 'string' ? normalizeString(localizedPayloadValue.message) : null;

    return {
      key,
      titleText,
      messageText,
    };
  };

  const extractField = (entry: unknown, field: 'title' | 'message'): string | null => {
    if (!isRecord(entry)) {
      return null;
    }
    const rawValue = (entry as Record<string, unknown>)[field];
    if (typeof rawValue === 'string') {
      return normalizeString(rawValue);
    }
    if (isRecord(rawValue)) {
      return normalizeString((rawValue as Record<string, string | null | undefined>)[langCode]);
    }
    return null;
  };

  const list = Array.isArray(value) ? value : [value];
  const entries: LocalizedImageEntry[] = [];

  for (let index = 0; index < list.length; index += 1) {
    const imageValue = list[index];
    const fallbackTitleText = extractField(imageValue, 'title');
    const fallbackMessageText = extractField(imageValue, 'message');

    let key = extractKey(imageValue, index);
    let titleText = fallbackTitleText;
    let messageText = fallbackMessageText;

    if (isRecord(imageValue)) {
      const localizedValue = (imageValue as Record<string, unknown>)[langCode];
      if (isRecord(localizedValue)) {
        const localizedPayload = extractLocalizedPayload(localizedValue, index);
        if (localizedPayload.key) {
          key = localizedPayload.key;
        }

        titleText = localizedPayload.titleText ?? fallbackTitleText;
        messageText = localizedPayload.messageText ?? fallbackMessageText;
      }
    }

    if (key) {
      entries.push({
        key,
        titleText,
        messageText,
      });
    }
  }

  return entries;
};

const resolvePlaceholderPath = (key: string, source: ModalImageSource): string => {
  if (typeof source === 'string') {
    return source;
  }
  if (typeof source === 'number') {
    const resolved = Image.resolveAssetSource(source);
    return normalizeString(resolved?.uri) ?? key;
  }
  if (key.startsWith(MISSING_IMAGE_KEY_PREFIX)) {
    return '';
  }
  return key;
};

export const isRemoteUrl = (value: string) => /^https?:\/\//i.test(value.trim());

export const joinUrl = (base: string, path: string) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

export const resolveImageSourceByKey = ({
  key,
  resolveImage,
  imageBase,
}: {
  key: string;
  resolveImage?: ((key: string) => ModalImageSource) | null;
  imageBase?: string | null;
}): ModalImageSource => {
  const normalized = normalizeString(key);
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith(MISSING_IMAGE_KEY_PREFIX)) {
    return null;
  }

  if (typeof resolveImage === 'function') {
    const resolved = resolveImage(normalized);
    if (resolved !== null && resolved !== undefined) {
      return resolved;
    }
  }

  if (isRemoteUrl(normalized)) {
    return normalized;
  }

  // Keep resolver precedence for non-URL keys.
  if (typeof resolveImage === 'function') {
    return null;
  }

  if (imageBase) {
    return joinUrl(imageBase, normalized);
  }

  return null;
};

export const getLocalizedPopupContent = (
  popup: PopupItemType | null | undefined,
  langCode: string,
): LocalizedPopupContent => ({
  titleText: getLocalizedValue(popup?.title, langCode),
  messageText: getLocalizedValue(popup?.message, langCode),
  linkUrl: getLocalizedValue(popup?.url, langCode),
});

export const applyContentVisibility = ({
  titleText,
  messageText,
  imageItems,
  hideTitle,
  hideMessage,
  hideImage,
}: {
  titleText: string | null;
  messageText: string | null;
  imageItems: PopupImageItem[];
  hideTitle: boolean;
  hideMessage: boolean;
  hideImage: boolean;
}) => ({
  titleText: hideTitle ? null : titleText,
  messageText: hideMessage ? null : messageText,
  imageItems: hideImage ? [] : imageItems,
});

export const buildPopupImageItems = ({
  imageEntries,
  resolveImageSource,
  imageFailedSet,
}: {
  imageEntries: LocalizedImageEntry[];
  resolveImageSource: (key: string) => ModalImageSource;
  imageFailedSet: Set<string>;
}): PopupImageItem[] => {
  const items: PopupImageItem[] = [];

  for (const { key, titleText, messageText } of imageEntries) {
    const source = resolveImageSource(key);
    const isMissing = source == null;
    const isFailed = imageFailedSet.has(key);
    const showPlaceholder = isMissing || isFailed;

    items.push({
      key,
      source,
      placeholderPath: resolvePlaceholderPath(key, source),
      showPlaceholder,
      titleText,
      messageText,
    });
  }

  return items;
};

const resolveTextForActiveImage = ({
  baseText,
  imageItems,
  activeImageIndex,
  allowOverride,
  pickText,
}: {
  baseText: string | null;
  imageItems: PopupImageItem[];
  activeImageIndex: number;
  allowOverride: boolean;
  pickText: (item: PopupImageItem) => string | null;
}): string | null => {
  if (!allowOverride || imageItems.length === 0) {
    return baseText;
  }

  const clampedIndex = Math.max(0, Math.min(activeImageIndex, imageItems.length - 1));
  const imageText = pickText(imageItems[clampedIndex]!);
  return imageText ?? baseText;
};

export const resolveTitleForActiveImage = ({
  titleText,
  imageItems,
  activeImageIndex,
  allowOverride = true,
}: {
  titleText: string | null;
  imageItems: PopupImageItem[];
  activeImageIndex: number;
  allowOverride?: boolean;
}): string | null =>
  resolveTextForActiveImage({
    baseText: titleText,
    imageItems,
    activeImageIndex,
    allowOverride,
    pickText: item => item.titleText,
  });

export const resolveMessageForActiveImage = ({
  messageText,
  imageItems,
  activeImageIndex,
  allowOverride = true,
}: {
  messageText: string | null;
  imageItems: PopupImageItem[];
  activeImageIndex: number;
  allowOverride?: boolean;
}): string | null => {
  return resolveTextForActiveImage({
    baseText: messageText,
    imageItems,
    activeImageIndex,
    allowOverride,
    pickText: item => item.messageText,
  });
};

const isPopupEligible = (item: PopupItemType, context: EligiblePopupContext): boolean => {
  const { langCode, appVersion, hiddenInSessionSet, now, storage } = context;

  const popupId = getPopupId(item);
  if (!popupId) {
    return false;
  }
  if (hiddenInSessionSet.has(popupId)) {
    return false;
  }
  if (storage && storage.getBoolean(popupId) === false) {
    return false;
  }

  const imageKeys = getLocalizedImageKeys(item.imgSrc, langCode);
  const hasImage = imageKeys.length > 0;
  const hasTitle = Boolean(getLocalizedValue(item.title, langCode));
  const hasMessage = Boolean(getLocalizedValue(item.message, langCode));
  if (!hasImage && !hasTitle && !hasMessage) {
    return false;
  }

  if (appVersion) {
    const versionTo = normalizeString(item.showVersionTo);
    if (!isWithinVersionRange(appVersion, item.showVersionFrom, versionTo)) {
      return false;
    }
  }

  return isWithinDateRange(now, item.showDateFrom, item.showDateTo);
};

export const getEligiblePopups = (popups: PopupItemType[], context: EligiblePopupContext): PopupItemType[] => {
  if (!Array.isArray(popups) || popups.length === 0) {
    return [];
  }

  return popups.filter(item => isPopupEligible(item, context));
};

export const resolvePopupSettings = (
  popup: PopupItemType | null | undefined,
  defaults: PopupSettingDefaults,
): PopupResolvedSettings => ({
  // Popup-level settings override global defaults when present.
  fullscreenImage: typeof popup?.fullscreenImage === 'boolean' ? popup.fullscreenImage : defaults.fullscreenImage,
  fullscreenImageResizeMode: normalizeImageResizeMode(
    popup?.fullscreenImageResizeMode ?? defaults.fullscreenImageResizeMode,
  ),
  panZoomEnabled: typeof popup?.panZoomEnabled === 'boolean' ? popup.panZoomEnabled : defaults.panZoomEnabled,
  maxZoomScale: normalizeMaxZoomScale(popup?.maxZoomScale, defaults.maxZoomScale),
  closeOnBackdropPress:
    typeof popup?.closeOnBackdropPress === 'boolean' ? popup.closeOnBackdropPress : defaults.closeOnBackdropPress,
  hideCloseButton: typeof popup?.hideCloseButton === 'boolean' ? popup.hideCloseButton : defaults.hideCloseButton,
});

export const calculateModalLayoutMetrics = ({
  windowWidth,
  windowHeight,
  insets,
  isFullscreenImageMode,
  fullscreenImageResizeMode,
  hasImage,
  hasText,
  titleText,
  messageText,
  imageItems,
  imageAspectRatios,
  activeImageIndex,
  hasImageDots,
  hasDontShowAgainToggle,
}: LayoutMetricsInput): LayoutMetrics => {
  // Safe-area bounds are the single source of truth for both fullscreen and modal layouts.
  const safeAreaWidth = Math.max(windowWidth - insets.left - insets.right, 0);
  const safeAreaHeight = Math.max(windowHeight - insets.top - insets.bottom, 0);
  const contentWidth = isFullscreenImageMode ? safeAreaWidth : Math.max(safeAreaWidth - MODAL_MARGIN * 2, 0);

  if (isFullscreenImageMode) {
    const maxImageHeight = hasImage ? safeAreaHeight : 0;
    const fallbackAspectRatio = hasImage ? 1 : DEFAULT_ASPECT_RATIO;
    const imageSizes: Record<string, ModalImageSize> = {};

    for (const item of imageItems) {
      if (fullscreenImageResizeMode === 'cover') {
        imageSizes[item.key] = { width: contentWidth, height: maxImageHeight };
        continue;
      }

      const ratio = imageAspectRatios[item.key] ?? fallbackAspectRatio;
      if (ratio <= 0 || contentWidth <= 0 || maxImageHeight <= 0) {
        imageSizes[item.key] = ZERO_SIZE;
        continue;
      }

      const width = Math.min(contentWidth, maxImageHeight * ratio);
      imageSizes[item.key] = { width, height: width / ratio };
    }

    const activeImageKey = imageItems[activeImageIndex]?.key ?? imageItems[0]?.key ?? null;
    const activeImageSize = activeImageKey ? imageSizes[activeImageKey] ?? ZERO_SIZE : ZERO_SIZE;
    const isActiveImageRatioKnown =
      fullscreenImageResizeMode === 'cover' || Boolean(activeImageKey && imageAspectRatios[activeImageKey] != null);
    const maxTextHeight = hasText
      ? Math.max(
          Math.min(safeAreaHeight * FULLSCREEN_TEXT_MAX_HEIGHT_RATIO, safeAreaHeight - FULLSCREEN_OVERLAY_INSET * 3),
          0,
        )
      : 0;

    return {
      contentWidth,
      maxImageHeight,
      maxTextHeight,
      fallbackAspectRatio,
      imageSizes,
      activeImageSize,
      isActiveImageRatioKnown,
    };
  }

  const fixedVerticalSpace =
    CLOSE_BUTTON_SIZE +
    CONTENT_GAP +
    (hasDontShowAgainToggle ? CHECK_ROW_HEIGHT + CONTENT_GAP : 0) +
    (hasImageDots ? CAROUSEL_DOTS_HEIGHT : 0) +
    MODAL_MARGIN * 2;
  const maxContentHeight = Math.max(safeAreaHeight - fixedVerticalSpace, 0);

  const minTextHeight = hasText
    ? Math.max(
        TEXT_SECTION_PADDING * 2 +
          (titleText ? TITLE_LINE_HEIGHT : 0) +
          (messageText ? MESSAGE_LINE_HEIGHT : 0) +
          (titleText && messageText ? TITLE_MESSAGE_GAP : 0),
        0,
      )
    : 0;

  const maxImageHeight = hasImage ? Math.max(maxContentHeight - (hasText ? minTextHeight + CONTENT_GAP : 0), 0) : 0;
  const fallbackAspectRatio = hasImage ? 1 : DEFAULT_ASPECT_RATIO;

  const imageSizes: Record<string, ModalImageSize> = {};
  for (const item of imageItems) {
    const ratio = imageAspectRatios[item.key] ?? fallbackAspectRatio;
    if (ratio <= 0 || contentWidth <= 0 || maxImageHeight <= 0) {
      imageSizes[item.key] = ZERO_SIZE;
      continue;
    }

    const width = Math.min(contentWidth, maxImageHeight * ratio);
    imageSizes[item.key] = { width, height: width / ratio };
  }

  const activeImageKey = imageItems[activeImageIndex]?.key ?? imageItems[0]?.key ?? null;
  const activeImageSize = activeImageKey ? imageSizes[activeImageKey] ?? ZERO_SIZE : ZERO_SIZE;
  const isActiveImageRatioKnown = Boolean(activeImageKey && imageAspectRatios[activeImageKey] != null);
  const maxTextHeight = hasText
    ? Math.max(maxContentHeight - (hasImage ? activeImageSize.height + CONTENT_GAP : 0), 0)
    : 0;

  return {
    contentWidth,
    maxImageHeight,
    maxTextHeight,
    fallbackAspectRatio,
    imageSizes,
    activeImageSize,
    isActiveImageRatioKnown,
  };
};
