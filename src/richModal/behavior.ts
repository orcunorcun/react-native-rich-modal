import { ASPECT_RATIO_EPSILON } from './helpers';

export const LOCAL_NOW_REFRESH_MS = 30_000;

export const shouldStartLocalNowRefresh = (parsedServerTime: Date | null): boolean => parsedServerTime == null;

export const shouldUpdateImageAspectRatio = ({
  currentRatio,
  nextRatio,
}: {
  currentRatio: number | undefined;
  nextRatio: number;
}): boolean => {
  return currentRatio == null || Math.abs(currentRatio - nextRatio) >= ASPECT_RATIO_EPSILON;
};

export const shouldAllowBackButtonClose = ({
  hideCloseButton,
  closeOnBackdropPress,
}: {
  hideCloseButton: boolean;
  closeOnBackdropPress: boolean;
}): boolean => {
  return !(hideCloseButton && !closeOnBackdropPress);
};
