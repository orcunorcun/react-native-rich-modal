import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, Text, View, useWindowDimensions } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import Colors from './assets/Colors';
import { CheckBoxCheckedIcon, CheckBoxUncheckedIcon, CrossIcon } from './assets/icons';
import CustomAnimatedIconToggle from './components/CustomAnimatedIconToggle';
import CustomModal from './components/CustomModal';
import CustomTouchable from './components/CustomTouchable';
import { CAROUSEL_HEIGHT_ANIMATION_MS, HIT_SLOP, POPUP_SHOW_DELAY_MS } from './constants';
import {
  LOCAL_NOW_REFRESH_MS,
  shouldAllowBackButtonClose,
  shouldStartLocalNowRefresh,
  shouldUpdateImageAspectRatio,
} from './richModal/behavior';
import RichModalMediaSection from './richModal/components/RichModalMediaSection';
import RichModalTextSection from './richModal/components/RichModalTextSection';
import {
  DEFAULT_MAX_ZOOM_SCALE,
  applyContentVisibility,
  buildPopupImageItems,
  calculateModalLayoutMetrics,
  getEligiblePopups,
  getFullscreenOverlayOffsets,
  getLocalizedImageEntries,
  getLocalizedPopupContent,
  getPopupId,
  normalizeImageResizeMode,
  normalizeMaxZoomScale,
  normalizeOpacity,
  normalizeString,
  resolveImageSourceByKey,
  resolveInsets,
  resolveMessageForActiveImage,
  resolvePopupSettings,
  resolveTitleForActiveImage,
  type EligiblePopupContext,
  type PopupSettingDefaults,
} from './richModal/helpers';
import { styles } from './richModal/styles';
import { parseDate } from './utils/filtering';

import type {
  ImageSource,
  RichModalImageResizeMode,
  RichModalLabels,
  RichModalProps,
  RichModalTheme,
} from './richModal/types';
import type { PopupItemType } from './types';

export type {
  ImageSource,
  RichModalComponents,
  RichModalIconComponent,
  RichModalIconProps,
  RichModalImageResizeMode,
  RichModalImageSize,
  RichModalInsets,
  RichModalLabels,
  RichModalPopupImage,
  RichModalProps,
  RichModalRenderCarouselDotProps,
  RichModalRenderCheckboxRowProps,
  RichModalRenderCloseButtonProps,
  RichModalRenderImageProps,
  RichModalRenderPlaceholderProps,
  RichModalStorage,
  RichModalStyleOverrides,
  RichModalTheme,
} from './richModal/types';

const DEFAULT_LABELS: Required<RichModalLabels> = {
  dontShowAgain: "Don't show again",
  missingImage: 'Image asset not found',
};
const DEFAULT_THEME: Required<RichModalTheme> = {
  overlayColor: Colors.black,
  overlayOpacity: 0.5,
  closeButtonBorderColor: Colors.white,
  closeButtonBackgroundColor: 'rgba(0,0,0,0.45)',
  closeIconColor: Colors.white,
  textCardBackgroundColor: Colors.white,
  titleColor: Colors.midnightBlue,
  messageColor: Colors.black,
  checkRowBackgroundColor: Colors.lightBlack,
  checkTextColor: Colors.white,
  checkboxActiveColor: Colors.white,
  checkboxInactiveColor: Colors.white,
  carouselDotActiveColor: Colors.sunsetOrange,
  carouselDotInactiveColor: Colors.white,
  placeholderBackgroundColor: Colors.black,
  placeholderTextColor: Colors.red,
  placeholderPathColor: Colors.white,
};
const REMOTE_IMAGE_SIZE_TIMEOUT_MS = 2000;

const RichModal = ({
  popups,
  serverTime = null,
  visible,
  langCode: langCodeProp = 'en',
  appVersion,
  storage: storageProp,
  imageBaseUrl,
  resolveImage,
  carouselLoop = true,
  carouselAutoPlay = false,
  carouselAutoPlayInterval,
  labels: labelsProp,
  onOpenUrl,
  onDismiss,
  useUserAgent = false,
  userAgent,
  showDelayMs = POPUP_SHOW_DELAY_MS,
  safeAreaInsets,
  closeOnBackdropPress = false,
  hideCloseButton = false,
  hideImage = false,
  hideTitle = false,
  hideMessage = false,
  fullscreenImage = false,
  fullscreenImageResizeMode: fullscreenImageResizeModeProp,
  panZoomEnabled = false,
  maxZoomScale: maxZoomScaleProp,
  closeIcon,
  checkboxCheckedIcon,
  checkboxUncheckedIcon,
  theme: themeProp,
  styleOverrides,
  components,
}: RichModalProps) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useMemo(() => resolveInsets(safeAreaInsets), [safeAreaInsets]);

  const [hiddenInSessionSet, setHiddenInSessionSet] = useState<Set<string>>(() => new Set());
  const [imageFailedSet, setImageFailedSet] = useState<Set<string>>(() => new Set());
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [displayedPopup, setDisplayedPopup] = useState<PopupItemType | null>(null);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<string, number>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const [localNowMs, setLocalNowMs] = useState(() => Date.now());
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedPopupIdRef = useRef<string | null>(null);
  const lastMaskSizeRef = useRef({ width: 0, height: 0 });
  const shouldAnimateMaskRef = useRef(false);
  const pendingImageSizeKeysRef = useRef<Set<string>>(new Set());
  const carouselProgress = useSharedValue(0);
  const isModalActive = visible;

  const langCode = normalizeString(langCodeProp) ?? 'en';
  const parsedServerTime = useMemo(() => parseDate(serverTime), [serverTime]);
  const now = useMemo(() => parsedServerTime ?? new Date(localNowMs), [localNowMs, parsedServerTime]);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...(labelsProp ?? {}) }), [labelsProp]);
  const storage = storageProp;
  const hasPersistentStorage = Boolean(storage);
  const CloseIconComponent = closeIcon ?? CrossIcon;
  const CheckedIconComponent = checkboxCheckedIcon ?? CheckBoxCheckedIcon;
  const UncheckedIconComponent = checkboxUncheckedIcon ?? CheckBoxUncheckedIcon;
  const theme = useMemo(
    () => ({
      ...DEFAULT_THEME,
      ...(themeProp ?? {}),
      overlayOpacity: normalizeOpacity(themeProp?.overlayOpacity, DEFAULT_THEME.overlayOpacity),
    }),
    [themeProp],
  );
  const renderCloseButtonOverride = components?.renderCloseButton;
  const renderCarouselDotOverride = components?.renderCarouselDot;
  const renderImageOverride = components?.renderImage;
  const renderPlaceholderOverride = components?.renderPlaceholder;
  const renderCheckboxRowOverride = components?.renderCheckboxRow;

  const imageBase = normalizeString(imageBaseUrl);

  useEffect(() => {
    if (!shouldStartLocalNowRefresh(parsedServerTime)) {
      return;
    }

    const timerId = setInterval(() => {
      setLocalNowMs(Date.now());
    }, LOCAL_NOW_REFRESH_MS);

    return () => {
      clearInterval(timerId);
    };
  }, [parsedServerTime]);

  const eligiblePopupContext = useMemo<EligiblePopupContext>(() => {
    return {
      langCode,
      appVersion,
      hiddenInSessionSet,
      now,
      storage,
    };
  }, [appVersion, hiddenInSessionSet, langCode, now, storage]);

  const eligiblePopups = useMemo(() => getEligiblePopups(popups, eligiblePopupContext), [eligiblePopupContext, popups]);

  const nextPopup = eligiblePopups[0] ?? null;
  const nextPopupId = getPopupId(nextPopup);
  const nextPopupRef = useRef<PopupItemType | null>(null);
  const currentPopup = displayedPopup;
  const popupId = getPopupId(currentPopup);

  useEffect(() => {
    nextPopupRef.current = nextPopup;
  }, [nextPopup]);

  const imageEntries = useMemo(
    () => getLocalizedImageEntries(currentPopup?.imgSrc, langCode),
    [currentPopup?.imgSrc, langCode],
  );

  useEffect(() => {
    setIsCarouselDragging(false);
  }, [popupId]);

  const imageItems = useMemo(
    () =>
      buildPopupImageItems({
        imageEntries,
        resolveImageSource: (key: string): ImageSource =>
          resolveImageSourceByKey({
            key,
            resolveImage,
            imageBase,
          }),
        imageFailedSet,
      }),
    [imageBase, imageEntries, imageFailedSet, resolveImage],
  );

  const localizedPopupContent = useMemo(
    () => getLocalizedPopupContent(currentPopup, langCode),
    [currentPopup, langCode],
  );
  const linkUrl = localizedPopupContent.linkUrl;
  const {
    titleText: baseTitleText,
    messageText: baseMessageText,
    imageItems: visibleImageItems,
  } = useMemo(
    () =>
      applyContentVisibility({
        titleText: localizedPopupContent.titleText,
        messageText: localizedPopupContent.messageText,
        imageItems,
        hideTitle,
        hideMessage,
        hideImage,
      }),
    [hideImage, hideMessage, hideTitle, imageItems, localizedPopupContent.messageText, localizedPopupContent.titleText],
  );

  const messageText = useMemo(
    () =>
      resolveMessageForActiveImage({
        messageText: baseMessageText,
        imageItems: visibleImageItems,
        activeImageIndex,
        allowOverride: !hideMessage,
      }),
    [activeImageIndex, baseMessageText, hideMessage, visibleImageItems],
  );

  const titleText = useMemo(
    () =>
      resolveTitleForActiveImage({
        titleText: baseTitleText,
        imageItems: visibleImageItems,
        activeImageIndex,
        allowOverride: !hideTitle,
      }),
    [activeImageIndex, baseTitleText, hideTitle, visibleImageItems],
  );

  const popupSettingDefaults = useMemo<PopupSettingDefaults>(
    () => ({
      fullscreenImage,
      fullscreenImageResizeMode: normalizeImageResizeMode(fullscreenImageResizeModeProp),
      panZoomEnabled,
      maxZoomScale: normalizeMaxZoomScale(maxZoomScaleProp, DEFAULT_MAX_ZOOM_SCALE),
      closeOnBackdropPress,
      hideCloseButton,
    }),
    [
      closeOnBackdropPress,
      fullscreenImage,
      fullscreenImageResizeModeProp,
      hideCloseButton,
      maxZoomScaleProp,
      panZoomEnabled,
    ],
  );
  const popupSettings = useMemo(
    () => resolvePopupSettings(currentPopup, popupSettingDefaults),
    [currentPopup, popupSettingDefaults],
  );
  const popupFullscreenImage = popupSettings.fullscreenImage;
  const popupPanZoomEnabled = popupSettings.panZoomEnabled;
  const popupMaxZoomScale = popupSettings.maxZoomScale;
  const popupCloseOnBackdropPress = popupSettings.closeOnBackdropPress;
  const popupHideCloseButton = popupSettings.hideCloseButton;
  const fullscreenImageResizeMode = popupSettings.fullscreenImageResizeMode;
  const imageCount = visibleImageItems.length;
  const hasImage = imageCount > 0;
  const isFullscreenImageMode = popupFullscreenImage && hasImage;
  const resolvedTextCardBackgroundColor =
    isFullscreenImageMode && themeProp?.textCardBackgroundColor == null
      ? 'rgba(0,0,0,0.55)'
      : theme.textCardBackgroundColor;
  const resolvedTitleColor = isFullscreenImageMode && themeProp?.titleColor == null ? Colors.white : theme.titleColor;
  const resolvedMessageColor =
    isFullscreenImageMode && themeProp?.messageColor == null ? '#E2E8F0' : theme.messageColor;
  const resolvedCheckRowBackgroundColor =
    isFullscreenImageMode && themeProp?.checkRowBackgroundColor == null
      ? 'rgba(0,0,0,0.55)'
      : theme.checkRowBackgroundColor;
  const hasText = !!titleText || !!messageText;
  const shouldShowDots = imageCount > 1;
  const fullscreenOverlayOffsets = useMemo(
    () =>
      getFullscreenOverlayOffsets({
        hasImageDots: shouldShowDots,
        hasDontShowAgainToggle: hasPersistentStorage,
      }),
    [hasPersistentStorage, shouldShowDots],
  );

  const {
    contentWidth,
    maxImageHeight,
    maxTextHeight,
    fallbackAspectRatio,
    imageSizes,
    activeImageSize,
    isActiveImageRatioKnown,
  } = useMemo(
    () =>
      calculateModalLayoutMetrics({
        windowWidth,
        windowHeight,
        insets,
        isFullscreenImageMode,
        fullscreenImageResizeMode,
        hasImage,
        hasText,
        titleText,
        messageText,
        imageItems: visibleImageItems,
        imageAspectRatios,
        activeImageIndex,
        hasImageDots: shouldShowDots,
        hasDontShowAgainToggle: hasPersistentStorage,
      }),
    [
      activeImageIndex,
      shouldShowDots,
      hasPersistentStorage,
      fullscreenImageResizeMode,
      isFullscreenImageMode,
      hasImage,
      hasText,
      imageAspectRatios,
      visibleImageItems,
      insets,
      messageText,
      titleText,
      windowHeight,
      windowWidth,
    ],
  );

  const modalWrapperStyle = useMemo(
    () => ({
      paddingTop: insets.top,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );

  const animatedMaskHeight = useSharedValue(activeImageSize.height);
  const animatedMaskStyle = useAnimatedStyle(() => ({
    height: animatedMaskHeight.value,
  }));

  useEffect(() => {
    const nextHeight = isFullscreenImageMode ? maxImageHeight : activeImageSize.height;
    const prevHeight = lastMaskSizeRef.current.height;

    if (nextHeight <= 0) {
      animatedMaskHeight.value = nextHeight;
      lastMaskSizeRef.current = { width: contentWidth, height: nextHeight };
      return;
    }

    if (isFullscreenImageMode) {
      animatedMaskHeight.value = nextHeight;
      lastMaskSizeRef.current = { width: contentWidth, height: nextHeight };
      return;
    }

    if (!isActiveImageRatioKnown && prevHeight > 0) {
      animatedMaskHeight.value = prevHeight;
      return;
    }

    if (shouldAnimateMaskRef.current && isActiveImageRatioKnown) {
      animatedMaskHeight.value = withTiming(nextHeight, {
        duration: CAROUSEL_HEIGHT_ANIMATION_MS,
        easing: Easing.inOut(Easing.ease),
      });
      shouldAnimateMaskRef.current = false;
    } else {
      animatedMaskHeight.value = nextHeight;
    }

    lastMaskSizeRef.current = { width: contentWidth, height: nextHeight };
  }, [
    activeImageSize.height,
    animatedMaskHeight,
    contentWidth,
    isActiveImageRatioKnown,
    isFullscreenImageMode,
    maxImageHeight,
  ]);

  const isImageSizesReady = useMemo(() => {
    if (!hasImage) {
      return true;
    }
    if (isFullscreenImageMode && fullscreenImageResizeMode === 'cover') {
      return true;
    }
    return visibleImageItems.every(item => item.showPlaceholder || imageAspectRatios[item.key] != null);
  }, [fullscreenImageResizeMode, hasImage, imageAspectRatios, isFullscreenImageMode, visibleImageItems]);

  useEffect(() => {
    setDontShowAgain(false);
    setImageFailedSet(() => new Set());
    setActiveImageIndex(0);
    setImageAspectRatios({});
    pendingImageSizeKeysRef.current.clear();
    lastMaskSizeRef.current = { width: 0, height: 0 };
    shouldAnimateMaskRef.current = false;
    carouselProgress.value = 0;
  }, [carouselProgress, popupId]);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const applyNextPopup = useCallback((targetPopupId: string | null) => {
    const candidate = nextPopupRef.current;
    if (!candidate || !targetPopupId || getPopupId(candidate) !== targetPopupId) {
      return;
    }
    setDisplayedPopup(prev => (prev === candidate ? prev : candidate));
  }, []);

  useEffect(() => {
    clearShowTimer();
    if (!isModalActive) {
      if (isModalVisible) {
        setIsModalVisible(false);
      }
      setDisplayedPopup(null);
      dismissedPopupIdRef.current = null;
      return;
    }

    if (!nextPopupId) {
      if (isModalVisible) {
        setIsModalVisible(false);
      }
      setDisplayedPopup(null);
      dismissedPopupIdRef.current = null;
      return;
    }

    if (showDelayMs <= 0 || popupId === nextPopupId) {
      applyNextPopup(nextPopupId);
      return;
    }

    if (!isModalVisible) {
      showTimerRef.current = setTimeout(() => {
        applyNextPopup(nextPopupId);
      }, showDelayMs);
    }

    return clearShowTimer;
  }, [applyNextPopup, clearShowTimer, isModalActive, isModalVisible, nextPopupId, popupId, showDelayMs]);

  useEffect(() => {
    if (!nextPopup || !nextPopupId) {
      return;
    }

    if (getPopupId(displayedPopup) !== nextPopupId) {
      return;
    }

    if (displayedPopup !== nextPopup) {
      setDisplayedPopup(nextPopup);
    }
  }, [displayedPopup, nextPopup, nextPopupId]);

  useEffect(() => {
    if (!isModalActive || !displayedPopup || isModalVisible) {
      return;
    }
    if (dismissedPopupIdRef.current && dismissedPopupIdRef.current === popupId) {
      return;
    }
    if (isImageSizesReady) {
      setIsModalVisible(true);
    }
  }, [displayedPopup, isImageSizesReady, isModalActive, isModalVisible, popupId]);

  const handleToggleDontShowAgain = useCallback(() => {
    setDontShowAgain(prev => !prev);
  }, []);

  const handleDismiss = useCallback(() => {
    if (!popupId || !currentPopup) {
      return;
    }

    dismissedPopupIdRef.current = popupId;
    setIsModalVisible(false);
    setHiddenInSessionSet(prev => {
      if (prev.has(popupId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(popupId);
      return next;
    });

    if (dontShowAgain && storage) {
      storage.set(popupId, false);
    }

    onDismiss?.(currentPopup);
  }, [currentPopup, dontShowAgain, onDismiss, popupId, storage]);

  const handleImageError = useCallback((key: string) => {
    setImageFailedSet(prev => {
      if (prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const recordImageAspectRatio = useCallback((key: string, width: number, height: number) => {
    if (width <= 0 || height <= 0) {
      return;
    }
    const nextRatio = width / height;
    setImageAspectRatios(prev => {
      const currentRatio = prev[key];
      if (!shouldUpdateImageAspectRatio({ currentRatio, nextRatio })) {
        return prev;
      }
      return { ...prev, [key]: nextRatio };
    });
  }, []);

  const recordFallbackAspectRatio = useCallback(
    (key: string) => {
      setImageAspectRatios(prev => {
        if (prev[key] != null) {
          return prev;
        }
        return { ...prev, [key]: fallbackAspectRatio };
      });
    },
    [fallbackAspectRatio],
  );

  const handleImageLoadDimensions = useCallback(
    (key: string, width: number, height: number) => {
      recordImageAspectRatio(key, width, height);
    },
    [recordImageAspectRatio],
  );

  useEffect(() => {
    if (!hasImage || visibleImageItems.length === 0) {
      return;
    }
    if (isFullscreenImageMode && fullscreenImageResizeMode === 'cover') {
      return;
    }

    let isActive = true;
    const pendingKeys = pendingImageSizeKeysRef.current;
    const pendingTimeouts: Array<ReturnType<typeof setTimeout>> = [];

    visibleImageItems.forEach(item => {
      if (!item.source || imageAspectRatios[item.key] != null || pendingKeys.has(item.key)) {
        return;
      }

      pendingKeys.add(item.key);

      if (typeof item.source === 'number') {
        const resolved = Image.resolveAssetSource(item.source);
        if (resolved?.width && resolved?.height && isActive) {
          recordImageAspectRatio(item.key, resolved.width, resolved.height);
        } else if (isActive) {
          recordFallbackAspectRatio(item.key);
        }
        pendingKeys.delete(item.key);
        return;
      }

      if (typeof item.source === 'string') {
        if (isActive) {
          recordFallbackAspectRatio(item.key);
        }

        const timeoutId = setTimeout(() => {
          pendingKeys.delete(item.key);
          if (isActive) {
            recordFallbackAspectRatio(item.key);
          }
        }, REMOTE_IMAGE_SIZE_TIMEOUT_MS);
        pendingTimeouts.push(timeoutId);

        Image.getSize(
          item.source,
          (width, height) => {
            clearTimeout(timeoutId);
            pendingKeys.delete(item.key);
            if (isActive) {
              recordImageAspectRatio(item.key, width, height);
            }
          },
          () => {
            clearTimeout(timeoutId);
            pendingKeys.delete(item.key);
            if (isActive) {
              recordFallbackAspectRatio(item.key);
            }
          },
        );
        return;
      }

      pendingKeys.delete(item.key);
      if (isActive) {
        recordFallbackAspectRatio(item.key);
      }
    });

    return () => {
      isActive = false;
      pendingTimeouts.forEach(clearTimeout);
    };
  }, [
    fullscreenImageResizeMode,
    hasImage,
    imageAspectRatios,
    visibleImageItems,
    isFullscreenImageMode,
    recordFallbackAspectRatio,
    recordImageAspectRatio,
  ]);

  const handleSnapToItem = useCallback(
    (index: number) => {
      if (imageCount === 0) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(index, imageCount - 1));
      setActiveImageIndex(prev => {
        if (prev === clampedIndex) {
          return prev;
        }
        shouldAnimateMaskRef.current = true;
        return clampedIndex;
      });
    },
    [imageCount],
  );

  const handleOpenUrl = useCallback(() => {
    if (!linkUrl || !currentPopup) {
      return;
    }
    if (onOpenUrl) {
      onOpenUrl(linkUrl, currentPopup);
    } else {
      Linking.openURL(linkUrl).catch(() => undefined);
    }
    handleDismiss();
  }, [currentPopup, handleDismiss, linkUrl, onOpenUrl]);

  const popupCloseOnBackButton = shouldAllowBackButtonClose({
    hideCloseButton: popupHideCloseButton,
    closeOnBackdropPress: popupCloseOnBackdropPress,
  });
  const shouldShowModal = isModalActive && isModalVisible && !!currentPopup;
  const shouldUseItemLinkTouchable = Boolean(linkUrl) && imageCount > 1;
  const shouldWrapContentWithLink = Boolean(linkUrl) && !shouldUseItemLinkTouchable;
  const isDoubleTapZoomEnabled = popupPanZoomEnabled && !linkUrl;
  const resolvedImageResizeMode: RichModalImageResizeMode = isFullscreenImageMode
    ? fullscreenImageResizeMode
    : 'contain';

  if (!currentPopup) {
    return null;
  }

  const contentBody = (
    <>
      <RichModalMediaSection
        popup={currentPopup}
        hasImage={hasImage}
        contentWidth={contentWidth}
        maxImageHeight={maxImageHeight}
        isFullscreenImageMode={isFullscreenImageMode}
        popupId={popupId}
        visibleImageItems={visibleImageItems}
        imageCount={imageCount}
        imageSizes={imageSizes}
        labelsMissingImage={labels.missingImage}
        renderImageOverride={renderImageOverride}
        renderPlaceholderOverride={renderPlaceholderOverride}
        renderCarouselDotOverride={renderCarouselDotOverride}
        resolvedImageResizeMode={resolvedImageResizeMode}
        popupPanZoomEnabled={popupPanZoomEnabled}
        isDoubleTapZoomEnabled={isDoubleTapZoomEnabled}
        isCarouselDragging={isCarouselDragging}
        popupMaxZoomScale={popupMaxZoomScale}
        shouldUseItemLinkTouchable={shouldUseItemLinkTouchable}
        useUserAgent={useUserAgent}
        userAgent={userAgent}
        onOpenUrl={handleOpenUrl}
        onImageError={handleImageError}
        onImageLoadDimensions={handleImageLoadDimensions}
        onSnapToItem={handleSnapToItem}
        onScrollStateChange={setIsCarouselDragging}
        carouselProgress={carouselProgress}
        carouselLoop={carouselLoop}
        carouselAutoPlay={carouselAutoPlay}
        carouselAutoPlayInterval={carouselAutoPlayInterval}
        carouselDotActiveColor={theme.carouselDotActiveColor}
        carouselDotInactiveColor={theme.carouselDotInactiveColor}
        placeholderBackgroundColor={theme.placeholderBackgroundColor}
        placeholderTextColor={theme.placeholderTextColor}
        placeholderPathColor={theme.placeholderPathColor}
        styleOverrides={styleOverrides}
        animatedMaskStyle={animatedMaskStyle}
        fullscreenDotsBottom={fullscreenOverlayOffsets.dotsBottom}
      />
      <RichModalTextSection
        hasText={hasText}
        isFullscreenImageMode={isFullscreenImageMode}
        maxTextHeight={maxTextHeight}
        titleText={titleText}
        messageText={messageText}
        resolvedTextCardBackgroundColor={resolvedTextCardBackgroundColor}
        resolvedTitleColor={resolvedTitleColor}
        resolvedMessageColor={resolvedMessageColor}
        styleOverrides={styleOverrides}
        fullscreenTextBottom={fullscreenOverlayOffsets.textBottom}
      />
    </>
  );

  const closeIconNode = <CloseIconComponent size={12} color={theme.closeIconColor} />;
  const closeButtonNode = popupHideCloseButton ? null : renderCloseButtonOverride ? (
    renderCloseButtonOverride({
      onPress: handleDismiss,
      icon: closeIconNode,
      popup: currentPopup,
    })
  ) : (
    <CustomTouchable
      onPress={handleDismiss}
      hitSlop={HIT_SLOP}
      style={[
        styles.closeButton,
        {
          borderColor: theme.closeButtonBorderColor,
          backgroundColor: theme.closeButtonBackgroundColor,
        },
        styleOverrides?.closeButton,
      ]}>
      {closeIconNode}
    </CustomTouchable>
  );

  const checkboxRowNode = hasPersistentStorage ? (
    renderCheckboxRowOverride ? (
      renderCheckboxRowOverride({
        checked: dontShowAgain,
        onToggle: handleToggleDontShowAgain,
        label: labels.dontShowAgain,
        checkedIcon: CheckedIconComponent,
        uncheckedIcon: UncheckedIconComponent,
        checkedColor: theme.checkboxActiveColor,
        uncheckedColor: theme.checkboxInactiveColor,
      })
    ) : (
      <CustomTouchable
        onPress={handleToggleDontShowAgain}
        style={[
          styles.checkRow,
          { backgroundColor: resolvedCheckRowBackgroundColor },
          isFullscreenImageMode
            ? [styles.checkRowFullscreen, { bottom: fullscreenOverlayOffsets.checkRowBottom }]
            : null,
          styleOverrides?.checkRow,
        ]}
        scalable>
        <CustomAnimatedIconToggle
          isActive={dontShowAgain}
          activeIcon={CheckedIconComponent}
          inactiveIcon={UncheckedIconComponent}
          activeColor={theme.checkboxActiveColor}
          inactiveColor={theme.checkboxInactiveColor}
          activeIconSize={18}
          inactiveIconSize={18}
          containerSize={20}
          hideRipple={true}
        />
        <Text
          style={[styles.checkText, { color: theme.checkTextColor }, styleOverrides?.checkText]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {labels.dontShowAgain}
        </Text>
      </CustomTouchable>
    )
  ) : null;

  return (
    <CustomModal
      visible={shouldShowModal}
      onClose={handleDismiss}
      presentation="center"
      animation="scale"
      overlayColor={theme.overlayColor}
      overlayOpacity={theme.overlayOpacity}
      closeOnBackdropPress={popupCloseOnBackdropPress}
      closeOnBackButton={popupCloseOnBackButton}
      wrapperStyle={modalWrapperStyle}
      contentStyle={[styles.modalContent, styleOverrides?.modalContent]}>
      <View
        style={[
          styles.container,
          { width: contentWidth, height: isFullscreenImageMode ? maxImageHeight : undefined },
          isFullscreenImageMode ? styles.containerFullscreen : null,
          styleOverrides?.container,
        ]}>
        {closeButtonNode ? (
          <View
            style={[
              styles.closeButtonWrapper,
              isFullscreenImageMode
                ? [
                    styles.closeButtonWrapperFullscreen,
                    { top: fullscreenOverlayOffsets.closeTop, right: fullscreenOverlayOffsets.closeRight },
                  ]
                : null,
              styleOverrides?.closeButtonWrapper,
            ]}>
            {closeButtonNode}
          </View>
        ) : null}
        {shouldWrapContentWithLink ? (
          <CustomTouchable
            onPress={handleOpenUrl}
            style={[
              styles.contentWrapper,
              isFullscreenImageMode ? styles.contentWrapperFullscreen : null,
              styleOverrides?.contentWrapper,
            ]}
            scalable>
            {contentBody}
          </CustomTouchable>
        ) : (
          <View
            style={[
              styles.contentWrapper,
              isFullscreenImageMode ? styles.contentWrapperFullscreen : null,
              styleOverrides?.contentWrapper,
            ]}>
            {contentBody}
          </View>
        )}
        {checkboxRowNode}
      </View>
    </CustomModal>
  );
};

export default RichModal;
