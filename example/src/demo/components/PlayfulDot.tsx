import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { styles } from '../styles';

import type { RichModalRenderCarouselDotProps } from 'react-native-rich-modal';

export const PlayfulDot = ({ index, progress, activeColor, inactiveColor }: RichModalRenderCarouselDotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    return {
      transform: [
        {
          scale: interpolate(distance, [0, 1], [1.2, 1], Extrapolation.CLAMP),
        },
      ],
      opacity: interpolate(distance, [0, 1], [1, 0.55], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(distance, [0, 1], [activeColor, inactiveColor], 'RGB') as string,
    };
  });

  return <Animated.View style={[styles.customDot, animatedStyle]} />;
};
