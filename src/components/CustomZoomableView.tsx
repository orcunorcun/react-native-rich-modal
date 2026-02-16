import { useCallback, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import type { ReactNode } from 'react';
import type { GestureResponderEvent, PanResponderGestureState, StyleProp, ViewStyle } from 'react-native';

type Translation = {
  x: number;
  y: number;
};

type TapPoint = {
  pageX: number;
  pageY: number;
};

type TimedTapPoint = TapPoint & {
  time: number;
};

export type CustomZoomableViewProps = {
  enabled?: boolean;
  doubleTapEnabled?: boolean;
  disablePan?: boolean;
  maxScale?: number;
  width: number;
  height: number;
  contentWidth?: number;
  contentHeight?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const DEFAULT_MAX_SCALE = 3;
const SCALE_RESET_THRESHOLD = 1.01;
const DOUBLE_TAP_DELAY_MS = 280;
const DOUBLE_TAP_MAX_DISTANCE = 24;
const TAP_MOVE_TOLERANCE = 10;

const clamp = (value: number, min: number, max: number): number => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const getDistance = (first: { pageX: number; pageY: number }, second: { pageX: number; pageY: number }) => {
  const dx = first.pageX - second.pageX;
  const dy = first.pageY - second.pageY;
  return Math.sqrt(dx * dx + dy * dy);
};

const getMaxOffsets = (
  scale: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
): Translation => {
  if (scale <= 1 || viewportWidth <= 0 || viewportHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) {
    return { x: 0, y: 0 };
  }

  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;

  return {
    x: Math.max((scaledWidth - viewportWidth) / 2, 0),
    y: Math.max((scaledHeight - viewportHeight) / 2, 0),
  };
};

const clampTranslation = (
  translation: Translation,
  scale: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
): Translation => {
  const max = getMaxOffsets(scale, viewportWidth, viewportHeight, contentWidth, contentHeight);

  return {
    x: clamp(translation.x, -max.x, max.x),
    y: clamp(translation.y, -max.y, max.y),
  };
};

const CustomZoomableView = ({
  enabled = false,
  doubleTapEnabled = true,
  disablePan = false,
  maxScale = DEFAULT_MAX_SCALE,
  width,
  height,
  contentWidth,
  contentHeight,
  style,
  children,
}: CustomZoomableViewProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const currentScaleRef = useRef(1);
  const currentTranslateRef = useRef<Translation>({ x: 0, y: 0 });
  const zoomContentWidth = contentWidth ?? width;
  const zoomContentHeight = contentHeight ?? height;
  const resolvedMaxScale =
    typeof maxScale === 'number' && Number.isFinite(maxScale) && maxScale > 1 ? maxScale : DEFAULT_MAX_SCALE;

  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startScale: 1,
  });

  const panStartRef = useRef<Translation>({ x: 0, y: 0 });
  const tapStartRef = useRef<TapPoint | null>(null);
  const lastTapRef = useRef<TimedTapPoint | null>(null);

  const setScale = useCallback(
    (value: number) => {
      currentScaleRef.current = value;
      scaleAnim.setValue(value);
    },
    [scaleAnim],
  );

  const setTranslation = useCallback(
    (next: Translation) => {
      currentTranslateRef.current = next;
      translateXAnim.setValue(next.x);
      translateYAnim.setValue(next.y);
    },
    [translateXAnim, translateYAnim],
  );

  const animateToState = useCallback(
    (nextScale: number, nextTranslation: Translation) => {
      currentScaleRef.current = nextScale;
      currentTranslateRef.current = nextTranslation;

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: nextScale,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: nextTranslation.x,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: nextTranslation.y,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [scaleAnim, translateXAnim, translateYAnim],
  );

  const resetToDefault = useCallback(() => {
    animateToState(1, { x: 0, y: 0 });
  }, [animateToState]);

  const applyScale = useCallback(
    (nextScale: number, animated = false) => {
      const clampedScale = clamp(nextScale, 1, resolvedMaxScale);
      const nextTranslation = clampTranslation(
        currentTranslateRef.current,
        clampedScale,
        width,
        height,
        zoomContentWidth,
        zoomContentHeight,
      );
      if (animated) {
        animateToState(clampedScale, nextTranslation);
        return;
      }
      setScale(clampedScale);
      setTranslation(nextTranslation);
    },
    [animateToState, height, resolvedMaxScale, setScale, setTranslation, width, zoomContentHeight, zoomContentWidth],
  );

  const tryHandleDoubleTap = useCallback(
    (point: TapPoint): boolean => {
      if (!enabled || !doubleTapEnabled) {
        return false;
      }

      const now = Date.now();
      const previousTap = lastTapRef.current;
      lastTapRef.current = { ...point, time: now };

      if (!previousTap) {
        return false;
      }

      const withinTime = now - previousTap.time <= DOUBLE_TAP_DELAY_MS;
      const withinDistance = getDistance(previousTap, point) <= DOUBLE_TAP_MAX_DISTANCE;
      if (!withinTime || !withinDistance) {
        return false;
      }

      if (currentScaleRef.current > SCALE_RESET_THRESHOLD) {
        resetToDefault();
        return true;
      }

      const targetScale = resolvedMaxScale;
      if (targetScale <= 1) {
        return false;
      }

      applyScale(targetScale, true);
      return true;
    },
    [applyScale, doubleTapEnabled, enabled, resetToDefault, resolvedMaxScale],
  );

  const beginPinch = useCallback((event: GestureResponderEvent) => {
    const touches = event.nativeEvent.touches;
    const first = touches[0];
    const second = touches[1];
    if (!first || !second) {
      return;
    }

    pinchRef.current = {
      active: true,
      startDistance: getDistance(first, second),
      startScale: currentScaleRef.current,
    };
  }, []);

  const beginPan = useCallback(() => {
    panStartRef.current = currentTranslateRef.current;
  }, []);

  const handleGrant = useCallback(
    (event: GestureResponderEvent) => {
      if (!enabled) {
        return;
      }

      if (event.nativeEvent.touches.length >= 2) {
        lastTapRef.current = null;
        beginPinch(event);
        return;
      }

      pinchRef.current.active = false;
      beginPan();
    },
    [beginPan, beginPinch, enabled],
  );

  const handleMove = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (!enabled || width <= 0 || height <= 0 || zoomContentWidth <= 0 || zoomContentHeight <= 0) {
        return;
      }

      const touches = event.nativeEvent.touches;

      if (touches.length >= 2) {
        const first = touches[0];
        const second = touches[1];
        if (!first || !second) {
          return;
        }

        const pinch = pinchRef.current;
        if (!pinch.active) {
          beginPinch(event);
          return;
        }

        const distance = getDistance(first, second);
        if (pinch.startDistance <= 0) {
          return;
        }

        const rawScale = (distance / pinch.startDistance) * pinch.startScale;
        const nextScale = clamp(rawScale, 1, resolvedMaxScale);

        const nextTranslation = clampTranslation(
          currentTranslateRef.current,
          nextScale,
          width,
          height,
          zoomContentWidth,
          zoomContentHeight,
        );
        setScale(nextScale);
        setTranslation(nextTranslation);
        return;
      }

      if (pinchRef.current.active) {
        pinchRef.current.active = false;
        beginPan();
      }

      if (currentScaleRef.current <= 1) {
        return;
      }

      if (disablePan) {
        return;
      }

      const nextTranslation = clampTranslation(
        {
          x: panStartRef.current.x + gestureState.dx,
          y: panStartRef.current.y + gestureState.dy,
        },
        currentScaleRef.current,
        width,
        height,
        zoomContentWidth,
        zoomContentHeight,
      );
      setTranslation(nextTranslation);
    },
    [
      beginPan,
      beginPinch,
      disablePan,
      enabled,
      height,
      resolvedMaxScale,
      setScale,
      setTranslation,
      width,
      zoomContentHeight,
      zoomContentWidth,
    ],
  );

  const handleRelease = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (!enabled) {
        return;
      }

      const releaseTouch = event.nativeEvent.changedTouches[0];
      const didMove = Math.abs(gestureState.dx) > TAP_MOVE_TOLERANCE || Math.abs(gestureState.dy) > TAP_MOVE_TOLERANCE;
      if (!pinchRef.current.active && !didMove && releaseTouch) {
        const handledByDoubleTap = tryHandleDoubleTap({
          pageX: releaseTouch.pageX,
          pageY: releaseTouch.pageY,
        });
        if (handledByDoubleTap) {
          pinchRef.current.active = false;
          return;
        }
      } else if (didMove) {
        lastTapRef.current = null;
      }

      pinchRef.current.active = false;

      if (currentScaleRef.current <= SCALE_RESET_THRESHOLD) {
        resetToDefault();
        return;
      }

      const clampedTranslation = clampTranslation(
        currentTranslateRef.current,
        currentScaleRef.current,
        width,
        height,
        zoomContentWidth,
        zoomContentHeight,
      );
      setTranslation(clampedTranslation);
    },
    [enabled, height, resetToDefault, setTranslation, tryHandleDoubleTap, width, zoomContentHeight, zoomContentWidth],
  );

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (!enabled || !doubleTapEnabled || currentScaleRef.current > SCALE_RESET_THRESHOLD) {
        return;
      }
      if (disablePan) {
        return;
      }
      const touch = event.nativeEvent.touches[0];
      if (!touch || event.nativeEvent.touches.length !== 1) {
        tapStartRef.current = null;
        return;
      }
      tapStartRef.current = {
        pageX: touch.pageX,
        pageY: touch.pageY,
      };
    },
    [disablePan, doubleTapEnabled, enabled],
  );

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!enabled || !doubleTapEnabled || currentScaleRef.current > SCALE_RESET_THRESHOLD) {
        return;
      }
      if (disablePan) {
        return;
      }
      const start = tapStartRef.current;
      const touch = event.nativeEvent.touches[0];
      if (!start || !touch || event.nativeEvent.touches.length !== 1) {
        tapStartRef.current = null;
        return;
      }
      if (getDistance(start, touch) > TAP_MOVE_TOLERANCE) {
        tapStartRef.current = null;
      }
    },
    [disablePan, doubleTapEnabled, enabled],
  );

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      if (!enabled || !doubleTapEnabled || currentScaleRef.current > SCALE_RESET_THRESHOLD) {
        return;
      }
      if (disablePan) {
        return;
      }
      const start = tapStartRef.current;
      tapStartRef.current = null;
      const touch = event.nativeEvent.changedTouches[0];
      if (!start || !touch) {
        return;
      }
      if (getDistance(start, touch) > TAP_MOVE_TOLERANCE) {
        return;
      }
      tryHandleDoubleTap({
        pageX: touch.pageX,
        pageY: touch.pageY,
      });
    },
    [disablePan, doubleTapEnabled, enabled, tryHandleDoubleTap],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: event => {
          if (!enabled) {
            return false;
          }
          const touches = event.nativeEvent.touches.length;
          return touches >= 2 || currentScaleRef.current > 1;
        },
        onMoveShouldSetPanResponder: event => {
          if (!enabled) {
            return false;
          }
          const touches = event.nativeEvent.touches.length;
          return touches >= 2 || currentScaleRef.current > 1;
        },
        onPanResponderGrant: handleGrant,
        onPanResponderMove: handleMove,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: handleRelease,
        onPanResponderTerminate: handleRelease,
      }),
    [enabled, handleGrant, handleMove, handleRelease],
  );

  if (!enabled || width <= 0 || height <= 0 || zoomContentWidth <= 0 || zoomContentHeight <= 0) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View
      style={[styles.container, { width, height }, style]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...panResponder.panHandlers}>
      <Animated.View
        style={{
          width: zoomContentWidth,
          height: zoomContentHeight,
          transform: [{ translateX: translateXAnim }, { translateY: translateYAnim }, { scale: scaleAnim }],
        }}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomZoomableView;
