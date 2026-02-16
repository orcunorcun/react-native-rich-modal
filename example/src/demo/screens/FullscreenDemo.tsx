import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RichModal, type PopupItemType, type RichModalImageResizeMode } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { resolveImage } from '../data/images';
import { FULLSCREEN_POPUPS } from '../data/popups';
import { useMemoryStorage } from '../hooks/useMemoryStorage';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

const FULLSCREEN_MODES: RichModalImageResizeMode[] = ['contain', 'cover'];
const MAX_ZOOM_SCALES = [2, 3, 4, 5] as const;

export const FullscreenDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('fullscreen');
  const { storage, reset } = useMemoryStorage();
  const [resizeMode, setResizeMode] = useState<RichModalImageResizeMode>('contain');
  const [panZoomEnabled, setPanZoomEnabled] = useState(true);
  const [maxZoomScale, setMaxZoomScale] = useState<number>(3);
  const fullscreenPopups = useMemo<PopupItemType[]>(
    () =>
      FULLSCREEN_POPUPS.map(popup => ({
        ...popup,
        panZoomEnabled,
        fullscreenImage: true,
        fullscreenImageResizeMode: resizeMode,
      })),
    [panZoomEnabled, resizeMode],
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
      title="Fullscreen image mode"
      description="When fullscreenImage is enabled, close/check controls are rendered over the image and respect safe-area insets."
      actions={actions}>
      {/* Resize mode selector for fullscreen image rendering. */}
      <View style={styles.modeSelectorRow}>
        {FULLSCREEN_MODES.map(mode => {
          const isActive = mode === resizeMode;

          return (
            <Pressable
              key={mode}
              onPress={() => setResizeMode(mode)}
              style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
              <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                {mode}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {/* This toggle writes pan+zoom into popup objects to demonstrate item-level override. */}
      <View style={styles.modeSelectorRow}>
        {[true, false].map(enabled => {
          const isActive = panZoomEnabled === enabled;
          const label = enabled ? 'pan+zoom on' : 'pan+zoom off';

          return (
            <Pressable
              key={label}
              onPress={() => setPanZoomEnabled(enabled)}
              style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
              <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {panZoomEnabled ? (
        <>
          <Text style={styles.storageInfo}>max zoom scale</Text>
          <View style={styles.modeSelectorRow}>
            {MAX_ZOOM_SCALES.map(scale => {
              const isActive = maxZoomScale === scale;
              const label = `${scale}x`;

              return (
                <Pressable
                  key={label}
                  onPress={() => setMaxZoomScale(scale)}
                  style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
                  <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
      <RichModal
        key={modalKey}
        popups={fullscreenPopups}
        visible={visible}
        langCode="en"
        resolveImage={resolveImage}
        safeAreaInsets={insets}
        storage={storage}
        maxZoomScale={maxZoomScale}
      />
    </DemoCard>
  );
};
