import React from 'react';
import { StyleSheet, View } from 'react-native';

import Colors from '../Colors';

type CrossIconProps = {
  size?: number;
  color?: string;
};

const CrossIcon: React.FC<CrossIconProps> = ({ size = 14, color = Colors.dukeBlue }) => {
  const strokeWidth = Math.max(1, Math.round(size * 0.14));
  const containerStyle = { width: size, height: size };
  const lineStyle = {
    width: size,
    height: strokeWidth,
    borderRadius: strokeWidth / 2,
    backgroundColor: color,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.line, styles.linePositive, lineStyle]} />
      <View style={[styles.line, styles.lineNegative, lineStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
  },
  linePositive: {
    transform: [{ rotate: '45deg' }],
  },
  lineNegative: {
    transform: [{ rotate: '-45deg' }],
  },
});

export default CrossIcon;
