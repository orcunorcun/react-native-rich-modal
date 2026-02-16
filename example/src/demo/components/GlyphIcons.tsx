import { Platform, StyleSheet, View } from 'react-native';

type GlyphIconProps = {
  size?: number;
  color?: string;
};

const clampSize = (size: number) => Math.max(10, size);
const toEven = (size: number) => {
  const rounded = Math.round(size);
  return rounded % 2 === 0 ? rounded : rounded + 1;
};

const buildStrokeWidth = (size: number) => Math.max(1, Math.round(size * 0.12));
const ANDROID_OPTICAL_Y_OFFSET = Platform.OS === 'android' ? 0.5 : 0;

export const DiamondIcon = ({ size = 14, color = '#FFFFFF' }: GlyphIconProps) => {
  const canvasSize = clampSize(size);
  const diamondSize = toEven(canvasSize * 0.56);

  return (
    <View style={[styles.canvas, { width: canvasSize, height: canvasSize }]}>
      <View
        style={[
          styles.opticalOffset,
          styles.diamond,
          {
            width: diamondSize,
            height: diamondSize,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

export const CircleIcon = ({ size = 14, color = '#FFFFFF' }: GlyphIconProps) => {
  const canvasSize = clampSize(size);
  const circleSize = toEven(canvasSize * 0.68);

  return (
    <View style={[styles.canvas, { width: canvasSize, height: canvasSize }]}>
      <View
        style={[
          styles.opticalOffset,
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderColor: color,
            borderWidth: buildStrokeWidth(canvasSize),
          },
        ]}
      />
    </View>
  );
};

export const DotIcon = ({ size = 14, color = '#FFFFFF' }: GlyphIconProps) => {
  const canvasSize = clampSize(size);
  const dotSize = toEven(canvasSize * 0.5);

  return (
    <View style={[styles.canvas, { width: canvasSize, height: canvasSize }]}>
      <View
        style={[
          styles.opticalOffset,
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  opticalOffset: {
    marginTop: ANDROID_OPTICAL_Y_OFFSET,
  },
  diamond: {
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  circle: {
    borderRadius: 999,
  },
  dot: {
    borderRadius: 999,
  },
});
