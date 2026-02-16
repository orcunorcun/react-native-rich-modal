export type ModalVisibilityTransition = 'none' | 'open' | 'close';

export const resolveVisibilityTransition = ({
  visible,
  wasVisible,
  isMounted,
  isClosing,
}: {
  visible: boolean;
  wasVisible: boolean;
  isMounted: boolean;
  isClosing: boolean;
}): ModalVisibilityTransition => {
  if (visible) {
    return !wasVisible || isClosing ? 'open' : 'none';
  }

  if (!isMounted || isClosing || !wasVisible) {
    return 'none';
  }

  return 'close';
};
