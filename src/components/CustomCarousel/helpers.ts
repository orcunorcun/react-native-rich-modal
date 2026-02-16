export const DEFAULT_AUTO_PLAY_INTERVAL_MS = 3000;

export const normalizeAutoPlayInterval = (
  value: number | undefined,
  fallback = DEFAULT_AUTO_PLAY_INTERVAL_MS,
): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
};

export const getNextCarouselIndex = ({
  currentIndex,
  length,
  loop,
}: {
  currentIndex: number;
  length: number;
  loop: boolean;
}): number | null => {
  if (length <= 1) {
    return null;
  }

  const safeCurrentIndex = Number.isFinite(currentIndex)
    ? Math.max(0, Math.min(Math.floor(currentIndex), length - 1))
    : 0;
  const nextIndex = safeCurrentIndex + 1;

  if (nextIndex < length) {
    return nextIndex;
  }

  return loop ? 0 : null;
};
