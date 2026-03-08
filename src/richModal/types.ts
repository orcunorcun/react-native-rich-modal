import type { PopupImageResizeMode, PopupItemType } from '../types';
import type { ComponentType, ReactNode } from 'react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type ImageSource = string | number | null;

export type RichModalPopupImage = {
  key: string;
  source: ImageSource;
  placeholderPath: string;
  showPlaceholder: boolean;
  titleText: string | null;
  messageText: string | null;
};

export type RichModalInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type RichModalImageSize = {
  width: number;
  height: number;
};

export type RichModalIconProps = {
  size?: number;
  color?: string;
};

export type RichModalIconComponent = ComponentType<RichModalIconProps>;
export type RichModalImageResizeMode = PopupImageResizeMode;

export type RichModalTheme = {
  overlayColor?: string;
  overlayOpacity?: number;
  closeButtonBorderColor?: string;
  closeButtonBackgroundColor?: string;
  closeIconColor?: string;
  textCardBackgroundColor?: string;
  titleColor?: string;
  messageColor?: string;
  checkRowBackgroundColor?: string;
  checkTextColor?: string;
  checkboxActiveColor?: string;
  checkboxInactiveColor?: string;
  carouselDotActiveColor?: string;
  carouselDotInactiveColor?: string;
  placeholderBackgroundColor?: string;
  placeholderTextColor?: string;
  placeholderPathColor?: string;
};

export type RichModalStyleOverrides = {
  modalContent?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  closeButtonWrapper?: StyleProp<ViewStyle>;
  closeButton?: StyleProp<ViewStyle>;
  contentWrapper?: StyleProp<ViewStyle>;
  image?: StyleProp<ImageStyle>;
  carouselOuter?: StyleProp<ViewStyle>;
  carouselWrapper?: StyleProp<ViewStyle>;
  carouselViewport?: StyleProp<ViewStyle>;
  carouselDots?: StyleProp<ViewStyle>;
  carouselItem?: StyleProp<ViewStyle>;
  placeholder?: StyleProp<ViewStyle>;
  placeholderText?: StyleProp<TextStyle>;
  placeholderPath?: StyleProp<TextStyle>;
  textCard?: StyleProp<ViewStyle>;
  textScroll?: StyleProp<ViewStyle>;
  textContent?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  message?: StyleProp<TextStyle>;
  checkRow?: StyleProp<ViewStyle>;
  checkText?: StyleProp<TextStyle>;
};

export type RichModalRenderCloseButtonProps = {
  onPress: () => void;
  icon: ReactNode;
  popup: PopupItemType;
  testID?: string;
};

export type RichModalRenderCarouselDotProps = {
  index: number;
  length: number;
  progress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  testID?: string;
};

export type RichModalRenderImageProps = {
  image: RichModalPopupImage;
  popup: PopupItemType;
  size: RichModalImageSize;
  resizeMode: RichModalImageResizeMode;
  panZoomEnabled: boolean;
  doubleTapEnabled: boolean;
  maxZoomScale: number;
  onError: () => void;
  onLoadDimensions: (width: number, height: number) => void;
  useUserAgent: boolean;
  userAgent?: string;
  testID?: string;
};

export type RichModalRenderPlaceholderProps = {
  image: RichModalPopupImage;
  popup: PopupItemType;
  label: string;
  testID?: string;
};

export type RichModalRenderCheckboxRowProps = {
  checked: boolean;
  onToggle: () => void;
  label: string;
  checkedIcon: RichModalIconComponent;
  uncheckedIcon: RichModalIconComponent;
  checkedColor: string;
  uncheckedColor: string;
  testID?: string;
  labelTestID?: string;
};

export type RichModalComponents = {
  renderCloseButton?: (props: RichModalRenderCloseButtonProps) => ReactNode;
  renderCarouselDot?: (props: RichModalRenderCarouselDotProps) => ReactNode;
  renderImage?: (props: RichModalRenderImageProps) => ReactNode;
  renderPlaceholder?: (props: RichModalRenderPlaceholderProps) => ReactNode;
  renderCheckboxRow?: (props: RichModalRenderCheckboxRowProps) => ReactNode;
};

export type RichModalStorage = {
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: boolean) => void;
};

export type RichModalLabels = {
  dontShowAgain?: string;
  missingImage?: string;
};

export type RichModalProps = {
  popups: PopupItemType[];
  serverTime?: string | null;
  visible: boolean;
  langCode?: string;
  appVersion?: string;
  storage?: RichModalStorage;
  imageBaseUrl?: string;
  resolveImage?: (key: string) => ImageSource;
  carouselLoop?: boolean;
  carouselAutoPlay?: boolean;
  carouselAutoPlayInterval?: number;
  labels?: RichModalLabels;
  onOpenUrl?: (url: string, popup: PopupItemType) => void;
  onDismiss?: (popup: PopupItemType) => void;
  useUserAgent?: boolean;
  userAgent?: string;
  showDelayMs?: number;
  safeAreaInsets?: Partial<RichModalInsets> | null;
  closeOnBackdropPress?: boolean;
  hideCloseButton?: boolean;
  hideImage?: boolean;
  hideTitle?: boolean;
  hideMessage?: boolean;
  fullscreenImage?: boolean;
  fullscreenImageResizeMode?: RichModalImageResizeMode;
  panZoomEnabled?: boolean;
  maxZoomScale?: number;
  closeIcon?: RichModalIconComponent;
  checkboxCheckedIcon?: RichModalIconComponent;
  checkboxUncheckedIcon?: RichModalIconComponent;
  testIDPrefix?: string;
  theme?: RichModalTheme;
  styleOverrides?: RichModalStyleOverrides;
  components?: RichModalComponents;
};
