import { memo } from 'react';
import { Pressable, Text } from 'react-native';

import { styles } from '../styles';

type DemoActionButtonProps = {
  title: string;
  onPress: () => void;
};

const DemoActionButton = ({ title, onPress }: DemoActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.demoActionButton, pressed ? styles.demoActionButtonPressed : null]}>
      <Text style={styles.demoActionButtonText}>{title}</Text>
    </Pressable>
  );
};

export default memo(DemoActionButton);
