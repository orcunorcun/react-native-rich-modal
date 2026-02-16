import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles';

type DemoCardProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export const DemoCard = ({ title, description, actions, children }: DemoCardProps) => {
  return (
    <View style={styles.demoContainer}>
      <Text style={styles.demoTitle}>{title}</Text>
      <Text style={styles.demoDescription}>{description}</Text>
      {actions ? <View style={styles.rowButtons}>{actions}</View> : null}
      {children}
    </View>
  );
};
