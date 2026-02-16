import React from 'react';
import { StyleSheet, View } from 'react-native';

import Colors from '../Colors';

type CheckBoxUncheckedIconProps = {
  size?: number;
  color?: string;
};

const CheckBoxUncheckedIcon: React.FC<CheckBoxUncheckedIconProps> = ({ size = 24, color = Colors.white }) => {
  const borderWidth = Math.max(1, Math.round(size * 0.08));
  const borderRadius = Math.max(2, Math.round(size * 0.14));
  const boxStyle = {
    width: size,
    height: size,
    borderWidth,
    borderRadius,
    borderColor: color,
  };

  return <View style={[styles.box, boxStyle]} />;
};

const styles = StyleSheet.create({
  box: {
    position: 'relative',
  },
});

export default CheckBoxUncheckedIcon;
