import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import Colors from '../assets/Colors';

import type { StyleProp, ViewStyle } from 'react-native';

type IconProps = {
  size?: number;
  color?: string;
};

type AnimatedIconComponent = React.ComponentType<IconProps>;

type IconAnimatedStyle = {
  transform: [{ scale: number }, { rotate: string }];
};

type RippleAnimationStyle = {
  opacity: number;
  transform: [{ scale: number }];
};

export type CustomAnimatedIconToggleProps = {
  isActive: boolean;
  isLoading?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  activeIconSize?: number;
  inactiveIconSize?: number;
  activeIconContainerStyle?: StyleProp<ViewStyle>;
  inactiveIconContainerStyle?: StyleProp<ViewStyle>;
  activeIcon: AnimatedIconComponent;
  inactiveIcon: AnimatedIconComponent;
  hideRipple?: boolean;
  rippleColorActive?: string;
  rippleColorInactive?: string;
  spinnerColor?: string;
  containerSize?: number;
  rippleSize?: number;
};

const DEFAULT_ACTIVE_COLOR = Colors.sunsetOrange;
const DEFAULT_INACTIVE_COLOR = Colors.dukeBlue;
const DEFAULT_SPINNER_COLOR = Colors.sunsetOrange;
const DEFAULT_ICON_SIZE = 21;
const DEFAULT_CONTAINER_SIZE = 36;

const ICON_PREP_SCALE = 0.75;
const ICON_PREP_ROTATION = -14;
const ICON_SCALE_TARGET = 1;
const ICON_ROTATION_TARGET = 0;
const RIPPLE_PREP_SCALE = 0.4;
const RIPPLE_PREP_OPACITY = 0.4;
const RIPPLE_SCALE_TARGET = 1.8;
const RIPPLE_DURATION_MS = 450;

const RIPPLE_MIN_SIZE = 8;
const RIPPLE_INSET = 4;

const ICON_SCALE_SPRING = { damping: 10, stiffness: 240, mass: 0.9 } as const;
const ICON_ROTATE_SPRING = { damping: 12, stiffness: 200 } as const;
const RIPPLE_TIMING = { duration: RIPPLE_DURATION_MS } as const;

type ReanimatedViewProps = Omit<React.ComponentProps<typeof View>, 'style'> & {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const ReanimatedView = Animated.View as unknown as React.ComponentType<ReanimatedViewProps>;

const resolveRippleSize = (rippleSize: number | undefined, containerSize: number): number =>
  rippleSize ?? Math.max(containerSize - RIPPLE_INSET, RIPPLE_MIN_SIZE);

const CustomAnimatedIconToggle = ({
  isActive,
  isLoading = false,
  activeColor = DEFAULT_ACTIVE_COLOR,
  inactiveColor = DEFAULT_INACTIVE_COLOR,
  activeIconSize = DEFAULT_ICON_SIZE,
  inactiveIconSize = DEFAULT_ICON_SIZE,
  activeIconContainerStyle,
  inactiveIconContainerStyle,
  activeIcon,
  inactiveIcon,
  hideRipple = false,
  rippleColorActive,
  rippleColorInactive,
  spinnerColor = DEFAULT_SPINNER_COLOR,
  containerSize = DEFAULT_CONTAINER_SIZE,
  rippleSize,
}: CustomAnimatedIconToggleProps) => {
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const previousIsActiveRef = useRef(isActive);

  const triggerActivationAnimation = useCallback(() => {
    iconScale.value = ICON_PREP_SCALE;
    iconRotation.value = ICON_PREP_ROTATION;
    rippleScale.value = RIPPLE_PREP_SCALE;
    rippleOpacity.value = RIPPLE_PREP_OPACITY;

    iconScale.value = withSpring(ICON_SCALE_TARGET, ICON_SCALE_SPRING);
    iconRotation.value = withSpring(ICON_ROTATION_TARGET, ICON_ROTATE_SPRING);
    rippleScale.value = withTiming(RIPPLE_SCALE_TARGET, RIPPLE_TIMING);
    rippleOpacity.value = withTiming(0, RIPPLE_TIMING);
  }, [iconRotation, iconScale, rippleOpacity, rippleScale]);

  useEffect(() => {
    if (isLoading) {
      // Defer updating the ref so we still animate after loading finishes
      return;
    }

    const wasActive = previousIsActiveRef.current;
    previousIsActiveRef.current = isActive;

    if (!wasActive && isActive) {
      triggerActivationAnimation();
    }
  }, [isActive, isLoading, triggerActivationAnimation]);

  const animatedIconStyle = useAnimatedStyle<IconAnimatedStyle>(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotation.value}deg` }],
  }));

  const rippleAnimatedStyle = useAnimatedStyle<RippleAnimationStyle>(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  const isIconActive = isActive;
  const IconComponent = isIconActive ? activeIcon : inactiveIcon;
  const iconSize = isIconActive ? activeIconSize : inactiveIconSize;
  const iconColor = isIconActive ? activeColor : inactiveColor;
  const iconContainerStyle = isIconActive ? activeIconContainerStyle : inactiveIconContainerStyle;
  const rippleColor = isIconActive ? rippleColorActive ?? activeColor : rippleColorInactive ?? inactiveColor;
  const finalRippleSize = resolveRippleSize(rippleSize, containerSize);

  const wrapperStyle = useMemo<ViewStyle>(
    () => ({
      width: containerSize,
      height: containerSize,
    }),
    [containerSize],
  );

  const rippleBaseStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      borderWidth: 2,
      top: '50%',
      left: '50%',
      borderColor: rippleColor,
      width: finalRippleSize,
      height: finalRippleSize,
      borderRadius: finalRippleSize / 2,
      marginLeft: -finalRippleSize / 2,
      marginTop: -finalRippleSize / 2,
    }),
    [finalRippleSize, rippleColor],
  );

  const rippleStyle = useMemo<StyleProp<ViewStyle>>(
    () => [rippleBaseStyle, rippleAnimatedStyle],
    [rippleAnimatedStyle, rippleBaseStyle],
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, wrapperStyle]}>
        <ActivityIndicator size="small" color={spinnerColor} />
      </View>
    );
  }

  return (
    <View style={[styles.centered, wrapperStyle]}>
      {!hideRipple ? <ReanimatedView pointerEvents="none" style={rippleStyle} /> : null}
      <ReanimatedView style={animatedIconStyle} key={isIconActive ? 'active' : 'inactive'}>
        <View style={iconContainerStyle}>
          <IconComponent size={iconSize} color={iconColor} />
        </View>
      </ReanimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomAnimatedIconToggle;
