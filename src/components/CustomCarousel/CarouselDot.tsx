import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import Colors from '../../assets/Colors';

import type { ComponentProps, ComponentType, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export interface CarouselDotProps {
  index: number;
  progress: SharedValue<number>;
  length: number;
  activeColor?: string;
  inactiveColor?: string;
  size?: number;
  activeWidth?: number;
}

type DotAnimatedStyle = {
  width: number;
  backgroundColor: string;
};

type ReanimatedViewProps = Omit<ComponentProps<typeof View>, 'style'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const ReanimatedView = Animated.View as unknown as ComponentType<ReanimatedViewProps>;

const DEFAULT_DOT_SIZE = 5;
const DEFAULT_ACTIVE_DOT_WIDTH = 16;
const DOT_BORDER_RADIUS_RATIO = 0.5;

const CarouselDot = ({
  index,
  progress,
  length,
  activeColor = Colors.sunsetOrange,
  inactiveColor = Colors.dukeBlue,
  size = DEFAULT_DOT_SIZE,
  activeWidth = DEFAULT_ACTIVE_DOT_WIDTH,
}: CarouselDotProps) => {
  const inputRange = [index - 1, index, index + 1];
  const widthOutputRange = [size, activeWidth, size];
  const colorOutputRange = [inactiveColor, activeColor, inactiveColor];

  const animatedDotStyle = useAnimatedStyle<DotAnimatedStyle>(() => {
    const wrappedProgress = index === 0 && progress.value >= length - 1 ? length - progress.value : progress.value;

    return {
      width: interpolate(wrappedProgress, inputRange, widthOutputRange, Extrapolation.CLAMP),
      backgroundColor: interpolateColor(wrappedProgress, inputRange, colorOutputRange, 'RGB') as string,
    };
  });

  const dotStaticStyle: ViewStyle = {
    height: size,
    borderRadius: size * DOT_BORDER_RADIUS_RATIO,
  };

  const dotStyle: StyleProp<ViewStyle> = [styles.dotBase, dotStaticStyle, animatedDotStyle];

  return <ReanimatedView style={dotStyle} />;
};

const styles = StyleSheet.create({
  dotBase: {
    width: DEFAULT_DOT_SIZE,
    backgroundColor: Colors.sunsetOrange,
  },
});

export default memo(CarouselDot);
