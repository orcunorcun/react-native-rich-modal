export type LocalizedText = {
  [key: string]: string | undefined;
};

export type PopupImageResizeMode = 'contain' | 'cover';
export type PopupImageText = LocalizedText | string | null;
export type PopupImageLocalizedContent = {
  src?: string | null;
  title?: string | null;
  message?: string | null;
};
export type PopupImageItemInput = {
  [key: string]: unknown;
  title?: PopupImageText;
  message?: PopupImageText;
};
export type PopupImageInput = PopupImageItemInput | string;

export interface PopupItemType {
  id: string;
  imgSrc?: PopupImageInput | PopupImageInput[] | null;
  title?: LocalizedText | string | null;
  message?: LocalizedText | string | null;
  url?: LocalizedText | string | null;
  showVersionFrom?: string | null;
  showVersionTo?: string | null;
  showDateFrom?: string | null;
  showDateTo?: string | null;
  closeOnBackdropPress?: boolean | null;
  hideCloseButton?: boolean | null;
  panZoomEnabled?: boolean | null;
  maxZoomScale?: number | null;
  fullscreenImage?: boolean | null;
  fullscreenImageResizeMode?: PopupImageResizeMode | null;
}
