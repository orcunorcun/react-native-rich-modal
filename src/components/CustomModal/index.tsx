import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useModalAnimations, type ModalAnimation, type SlideFrom, type SpringConfig } from './useModalAnimations';
import { resolveVisibilityTransition } from './visibility';
import Colors from '../../assets/Colors';

import type { ComponentProps, ComponentType, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type ModalPresentation = 'center' | 'bottom' | 'full';
type ContentTransform = { translateX: number } | { translateY: number } | { scale: number };
type ContentAnimatedStyle = {
  opacity: number;
  transform: ContentTransform[];
};
type OverlayAnimatedStyle = {
  opacity: number;
};
type ReanimatedViewProps = Omit<ComponentProps<typeof View>, 'style'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const DEFAULT_OVERLAY_COLOR = Colors.black;
const DEFAULT_OVERLAY_OPACITY = 0.4;
const DEFAULT_ENTER_DURATION = 220;
const DEFAULT_EXIT_DURATION = 220;
const DEFAULT_SCALE_FROM = 0.96;
const DEFAULT_SPRING_CONFIG: SpringConfig = {
  damping: 20,
  stiffness: 160,
  mass: 0.9,
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
};
const DEFAULT_SLIDE_FROM: SlideFrom = 'bottom';

const ReanimatedView = Animated.View as unknown as ComponentType<ReanimatedViewProps>;

export interface CustomModalProps {
  visible: boolean;
  onClose?: () => void;
  onClosed?: () => void;
  children: ReactNode;
  presentation?: ModalPresentation;
  animation?: ModalAnimation;
  slideFrom?: SlideFrom;
  overlayColor?: string;
  overlayOpacity?: number;
  hideOverlay?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
  enterDuration?: number;
  exitDuration?: number;
  scaleFrom?: number;
  springConfig?: SpringConfig;
  wrapperStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
  statusBarTranslucent?: boolean;
}

const CustomModal = ({
  visible,
  onClose,
  onClosed,
  children,
  presentation = 'bottom',
  animation = 'slide',
  slideFrom,
  overlayColor = DEFAULT_OVERLAY_COLOR,
  overlayOpacity = DEFAULT_OVERLAY_OPACITY,
  hideOverlay = false,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  enterDuration = DEFAULT_ENTER_DURATION,
  exitDuration = DEFAULT_EXIT_DURATION,
  scaleFrom = DEFAULT_SCALE_FROM,
  springConfig = DEFAULT_SPRING_CONFIG,
  wrapperStyle,
  contentStyle,
  overlayStyle,
  statusBarTranslucent = true,
}: CustomModalProps) => {
  const { width, height } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const isClosingRef = useRef(false);
  const closeRequestedRef = useRef(false);
  const visibleRef = useRef(visible);
  const previousVisibleRef = useRef(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const contentOpacity = useSharedValue(animation === 'none' ? 1 : 0);
  const contentScale = useSharedValue(animation === 'scale' ? scaleFrom : 1);
  const overlayAlpha = useSharedValue(0);

  visibleRef.current = visible;

  const resolvedSlideFrom = useMemo<SlideFrom>(() => slideFrom ?? DEFAULT_SLIDE_FROM, [slideFrom]);

  const containerAlignStyle = useMemo(() => {
    if (presentation === 'center') {
      return styles.centerContainer;
    }
    if (presentation === 'full') {
      return styles.fullContainer;
    }
    return styles.bottomContainer;
  }, [presentation]);

  const overlayTargetOpacity = hideOverlay ? 0 : overlayOpacity;

  const finishClose = useCallback(() => {
    if (visibleRef.current) {
      isClosingRef.current = false;
      closeRequestedRef.current = false;
      return;
    }

    if (!closeRequestedRef.current) {
      return;
    }

    closeRequestedRef.current = false;
    isClosingRef.current = false;
    setIsMounted(false);
    onClosed?.();
  }, [onClosed]);

  const { animateIn, animateOut } = useModalAnimations({
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
  });

  const animateInRef = useRef(animateIn);
  const animateOutRef = useRef(animateOut);

  useEffect(() => {
    animateInRef.current = animateIn;
    animateOutRef.current = animateOut;
  }, [animateIn, animateOut]);

  useEffect(() => {
    const wasVisible = previousVisibleRef.current;
    const transition = resolveVisibilityTransition({
      visible,
      wasVisible,
      isMounted,
      isClosing: isClosingRef.current,
    });

    if (transition === 'open') {
      isClosingRef.current = false;
      closeRequestedRef.current = false;
      if (!isMounted) {
        setIsMounted(true);
      }
      animateInRef.current();
    } else if (transition === 'close') {
      isClosingRef.current = true;
      closeRequestedRef.current = true;
      animateOutRef.current();
    }

    previousVisibleRef.current = visible;
  }, [isMounted, visible]);

  const requestClose = useCallback(() => {
    if (!closeOnBackButton || isClosingRef.current) {
      return;
    }
    onClose?.();
  }, [closeOnBackButton, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (!closeOnBackdropPress || isClosingRef.current) {
      return;
    }
    onClose?.();
  }, [closeOnBackdropPress, onClose]);

  const contentAnimatedStyle = useAnimatedStyle<ContentAnimatedStyle>(() => {
    const transforms: ContentTransform[] = [];
    if (animation === 'slide') {
      transforms.push({ translateX: translateX.value }, { translateY: translateY.value });
    }
    if (animation === 'scale') {
      transforms.push({ scale: contentScale.value });
    }
    return {
      opacity: contentOpacity.value,
      transform: transforms,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle<OverlayAnimatedStyle>(() => ({
    opacity: overlayAlpha.value,
  }));

  const overlayColorStyle = useMemo<ViewStyle>(() => ({ backgroundColor: overlayColor }), [overlayColor]);
  const combinedOverlayStyle = useMemo<StyleProp<ViewStyle>>(
    () => [styles.overlay, overlayColorStyle, overlayStyle, overlayAnimatedStyle],
    [overlayAnimatedStyle, overlayColorStyle, overlayStyle],
  );
  const combinedContentStyle = useMemo<StyleProp<ViewStyle>>(
    () => [styles.content, contentStyle, contentAnimatedStyle],
    [contentAnimatedStyle, contentStyle],
  );

  if (!isMounted) {
    return null;
  }

  return (
    // We wrap the Modal with an extra View to fix a Android issue
    // https://github.com/omahili/react-native-reorderable-list/issues/17#issuecomment-2560430516
    <View>
      <Modal
        visible={isMounted}
        transparent
        statusBarTranslucent={statusBarTranslucent}
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={requestClose}>
        <View style={styles.modalRoot}>
          <ReanimatedView style={combinedOverlayStyle}>
            <Pressable style={styles.overlayPressable} onPress={handleBackdropPress} />
          </ReanimatedView>
          <View style={[styles.container, containerAlignStyle, wrapperStyle]} pointerEvents="box-none">
            <ReanimatedView style={combinedContentStyle}>{children}</ReanimatedView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullContainer: {
    justifyContent: 'flex-start',
  },
  content: {
    alignSelf: 'stretch',
  },
});

export default CustomModal;
