import type { EdgeInsets } from 'react-native-safe-area-context';

export type DemoId = 'basic' | 'theme' | 'components' | 'storage' | 'fullscreen' | 'carouselLab' | 'language';

export type DemoOption = {
  id: DemoId;
  title: string;
  subtitle: string;
};

export type DemoScreenProps = {
  insets: EdgeInsets;
};
