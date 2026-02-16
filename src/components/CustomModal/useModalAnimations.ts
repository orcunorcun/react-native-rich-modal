import { useCallback } from 'react';
import { cancelAnimation, runOnJS, withSpring, withTiming } from 'react-native-reanimated';

import type { SharedValue } from 'react-native-reanimated';

export type ModalAnimation = 'none' | 'fade' | 'slide' | 'scale';
export type SlideFrom = 'bottom' | 'top' | 'left' | 'right';
export type SpringConfig = {
  damping: number;
  stiffness: number;
  mass: number;
  overshootClamping: boolean;
  restDisplacementThreshold: number;
};

const getHiddenOffset = (slideFrom: SlideFrom, width: number, height: number) => {
  switch (slideFrom) {
    case 'top':
      return { x: 0, y: -height };
    case 'left':
      return { x: -width, y: 0 };
    case 'right':
      return { x: width, y: 0 };
    case 'bottom':
    default:
      return { x: 0, y: height };
  }
};

type UseModalAnimationsParams = {
  animation: ModalAnimation;
  resolvedSlideFrom: SlideFrom;
  width: number;
  height: number;
  scaleFrom: number;
  enterDuration: number;
  exitDuration: number;
  overlayTargetOpacity: number;
  springConfig: SpringConfig;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  contentScale: SharedValue<number>;
  contentOpacity: SharedValue<number>;
  overlayAlpha: SharedValue<number>;
  finishClose: () => void;
};

export const useModalAnimations = ({
  animation,
  resolvedSlideFrom,
  width,
  height,
  scaleFrom,
  enterDuration,
  exitDuration,
  overlayTargetOpacity,
  springConfig,
  translateX,
  translateY,
  contentScale,
  contentOpacity,
  overlayAlpha,
  finishClose,
}: UseModalAnimationsParams) => {
  const animateIn = useCallback(() => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(contentScale);
    cancelAnimation(contentOpacity);
    cancelAnimation(overlayAlpha);

    const { x, y } = getHiddenOffset(resolvedSlideFrom, width, height);

    translateX.value = animation === 'slide' ? x : 0;
    translateY.value = animation === 'slide' ? y : 0;
    contentScale.value = animation === 'scale' ? scaleFrom : 1;
    contentOpacity.value = animation === 'fade' || animation === 'scale' ? 0 : 1;
    overlayAlpha.value = 0;

    if (animation === 'slide') {
      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, springConfig);
    }

    if (animation === 'scale') {
      contentScale.value = withSpring(1, springConfig);
      contentOpacity.value = withTiming(1, { duration: enterDuration });
    }

    if (animation === 'fade') {
      contentOpacity.value = withTiming(1, { duration: enterDuration });
    }

    if (animation === 'none') {
      contentOpacity.value = 1;
      overlayAlpha.value = overlayTargetOpacity;
      return;
    }

    overlayAlpha.value = withTiming(overlayTargetOpacity, {
      duration: enterDuration,
    });
  }, [
    animation,
    contentOpacity,
    contentScale,
    enterDuration,
    height,
    overlayAlpha,
    overlayTargetOpacity,
    resolvedSlideFrom,
    scaleFrom,
    springConfig,
    translateX,
    translateY,
    width,
  ]);

  const animateOut = useCallback(() => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(contentScale);
    cancelAnimation(contentOpacity);
    cancelAnimation(overlayAlpha);

    const { x, y } = getHiddenOffset(resolvedSlideFrom, width, height);
    const shouldAnimateX = x !== 0;
    const shouldAnimateY = y !== 0;
    const shouldAnimateOverlay = overlayTargetOpacity !== 0;

    if (animation === 'none') {
      overlayAlpha.value = 0;
      finishClose();
      return;
    }

    if (animation === 'slide' && !shouldAnimateX && !shouldAnimateY && !shouldAnimateOverlay) {
      finishClose();
      return;
    }

    const onFinish = (finished?: boolean) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    };

    if (animation === 'slide') {
      const assignOnFinishToX = shouldAnimateX;
      const assignOnFinishToY = !shouldAnimateX && shouldAnimateY;

      translateX.value = withTiming(x, { duration: exitDuration }, assignOnFinishToX ? onFinish : undefined);
      translateY.value = withTiming(y, { duration: exitDuration }, assignOnFinishToY ? onFinish : undefined);
    }

    if (animation === 'scale') {
      contentScale.value = withTiming(scaleFrom, { duration: exitDuration }, onFinish);
      contentOpacity.value = withTiming(0, { duration: exitDuration });
    }

    if (animation === 'fade') {
      contentOpacity.value = withTiming(0, { duration: exitDuration }, onFinish);
    }

    const shouldAttachFinishToOverlay =
      animation === 'slide' && !shouldAnimateX && !shouldAnimateY && shouldAnimateOverlay;
    overlayAlpha.value = withTiming(0, { duration: exitDuration }, shouldAttachFinishToOverlay ? onFinish : undefined);
  }, [
    animation,
    contentOpacity,
    contentScale,
    exitDuration,
    finishClose,
    height,
    overlayAlpha,
    overlayTargetOpacity,
    resolvedSlideFrom,
    scaleFrom,
    translateX,
    translateY,
    width,
  ]);

  return { animateIn, animateOut };
};
