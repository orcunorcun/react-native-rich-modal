import React from 'react';
import { StyleSheet, View } from 'react-native';

import Colors from '../Colors';

type CheckBoxCheckedIconProps = {
  size?: number;
  color?: string;
};

const CheckBoxCheckedIcon: React.FC<CheckBoxCheckedIconProps> = ({ size = 24, color = Colors.white }) => {
  const borderWidth = Math.max(1, Math.round(size * 0.08));
  const borderRadius = Math.max(2, Math.round(size * 0.14));
  const strokeWidth = Math.max(1.5, size * 0.11);

  const boxStyle = {
    width: size,
    height: size,
    borderWidth,
    borderRadius,
    borderColor: color,
  };
  const shortMarkStyle = {
    left: size * 0.18,
    top: size * 0.54,
    width: size * 0.26,
    height: strokeWidth,
    borderRadius: strokeWidth / 2,
    backgroundColor: color,
  };
  const longMarkStyle = {
    left: size * 0.3,
    top: size * 0.5,
    width: size * 0.5,
    height: strokeWidth,
    borderRadius: strokeWidth / 2,
    backgroundColor: color,
  };

  return (
    <View style={[styles.box, boxStyle]}>
      <View style={[styles.mark, styles.markShort, shortMarkStyle]} />
      <View style={[styles.mark, styles.markLong, longMarkStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    position: 'relative',
  },
  mark: {
    position: 'absolute',
  },
  markShort: {
    transform: [{ rotate: '45deg' }],
  },
  markLong: {
    transform: [{ rotate: '-45deg' }],
  },
});

export default CheckBoxCheckedIcon;
