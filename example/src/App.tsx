import { useFonts } from 'expo-font';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEMO_OPTIONS } from './demo/config';
import { DemoFontSources } from './demo/fonts';
import {
  BasicDemo,
  CarouselLabDemo,
  ComponentsDemo,
  FullscreenDemo,
  LanguageDemo,
  StorageDemo,
  ThemeDemo,
} from './demo/screens';
import { styles } from './demo/styles';

import type { DemoId, DemoScreenProps } from './demo/types';
import type { ComponentType } from 'react';

const DEMO_SCREENS: Record<DemoId, ComponentType<DemoScreenProps>> = {
  basic: BasicDemo,
  theme: ThemeDemo,
  components: ComponentsDemo,
  storage: StorageDemo,
  fullscreen: FullscreenDemo,
  carouselLab: CarouselLabDemo,
  language: LanguageDemo,
};

const App = () => {
  const insets = useSafeAreaInsets();
  const [fontsLoaded, fontsError] = useFonts(DemoFontSources);
  const [activeDemo, setActiveDemo] = useState<DemoId>('basic');
  const ActiveDemoScreen = DEMO_SCREENS[activeDemo];

  if (!fontsLoaded && !fontsError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="small" color="#0F172A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.screenScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>react-native-rich-modal</Text>
          <Text style={styles.subtitle}>Browse examples from basic to advanced customization.</Text>
        </View>

        <View style={styles.tabList}>
          {DEMO_OPTIONS.map(option => {
            const isActive = option.id === activeDemo;

            return (
              <Pressable
                key={option.id}
                onPress={() => setActiveDemo(option.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}>
                <Text style={[styles.tabTitle, isActive && styles.tabTitleActive]}>{option.title}</Text>
                <Text style={[styles.tabSubtitle, isActive && styles.tabSubtitleActive]}>{option.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.demoStage}>
          <ActiveDemoScreen insets={insets} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
