import { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { RichModal, type RichModalComponents, type RichModalTheme } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { PlayfulDot } from '../components/PlayfulDot';
import { resolveImage } from '../data/images';
import { COMPONENT_POPUPS } from '../data/popups';
import { useMemoryStorage } from '../hooks/useMemoryStorage';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

export const ComponentsDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('components');
  const { storage, reset } = useMemoryStorage();
  const theme = useMemo<RichModalTheme>(
    () => ({
      overlayColor: '#111827',
      overlayOpacity: 0.65,
      textCardBackgroundColor: '#E0F2FE',
      titleColor: '#1E3A8A',
      messageColor: '#0C4A6E',
    }),
    [],
  );

  // Keep override renderers stable to avoid forcing RichModal subtree re-renders.
  const components = useMemo<RichModalComponents>(
    () => ({
      renderCloseButton: ({ onPress }) => (
        <Pressable onPress={onPress} style={styles.customCloseButton}>
          <Text style={styles.customCloseText}>Skip</Text>
        </Pressable>
      ),
      renderCarouselDot: props => <PlayfulDot {...props} />,
      renderImage: ({ image, size, onError, onLoadDimensions }) => {
        if (!image.source) {
          return null;
        }

        const source = typeof image.source === 'string' ? { uri: image.source } : image.source;

        return (
          <Image
            source={source}
            resizeMode="cover"
            style={[styles.customImage, { width: size.width, height: size.height }]}
            onError={onError}
            onLoad={event => {
              const width = event.nativeEvent?.source?.width;
              const height = event.nativeEvent?.source?.height;
              // Keep RichModal's size calculations in sync when using a custom image renderer.
              if (typeof width === 'number' && typeof height === 'number') {
                onLoadDimensions(width, height);
              }
            }}
          />
        );
      },
      renderPlaceholder: ({ image, label }) => (
        <View style={styles.customPlaceholder}>
          <Text style={styles.customPlaceholderTitle}>Missing image</Text>
          <Text style={styles.customPlaceholderText}>{label}</Text>
          <Text style={styles.customPlaceholderPath}>{image.placeholderPath}</Text>
        </View>
      ),
      renderCheckboxRow: ({ checked, label, onToggle }) => (
        <Pressable onPress={onToggle} style={styles.customCheckRow}>
          <Text style={styles.customCheckIndicator}>{checked ? '[x]' : '[ ]'}</Text>
          <Text style={styles.customCheckLabel}>{label}</Text>
        </Pressable>
      ),
    }),
    [],
  );

  const actions = useMemo(
    () => (
      <>
        <DemoActionButton title="Play popup" onPress={replay} />
        <DemoActionButton title="Reset storage" onPress={reset} />
      </>
    ),
    [replay, reset],
  );

  return (
    <DemoCard
      title="Component overrides"
      description="Override close button, dots, image rendering, placeholder and checkbox row."
      actions={actions}>
      <RichModal
        key={modalKey}
        popups={COMPONENT_POPUPS}
        visible={visible}
        langCode="en"
        resolveImage={resolveImage}
        safeAreaInsets={insets}
        storage={storage}
        theme={theme}
        components={components}
      />
    </DemoCard>
  );
};
