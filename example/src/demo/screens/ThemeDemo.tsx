import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RichModal, type RichModalStyleOverrides, type RichModalTheme } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { DiamondIcon, DotIcon, CircleIcon } from '../components/GlyphIcons';
import { resolveImage } from '../data/images';
import { THEMED_POPUPS } from '../data/popups';
import { useMemoryStorage } from '../hooks/useMemoryStorage';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

type ThemePalette = {
  id: string;
  title: string;
  preview: [string, string, string];
  theme: RichModalTheme;
};

const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'sunrise',
    title: 'Sunrise',
    preview: ['#F97316', '#FEF3C7', '#7C2D12'],
    theme: {
      overlayColor: '#0F172A',
      closeButtonBorderColor: '#F59E0B',
      closeIconColor: '#F59E0B',
      carouselDotActiveColor: '#F97316',
      carouselDotInactiveColor: '#CBD5E1',
      textCardBackgroundColor: '#FEF3C7',
      titleColor: '#9A3412',
      messageColor: '#7C2D12',
      checkRowBackgroundColor: '#1E293B',
      checkTextColor: '#F8FAFC',
    },
  },
  {
    id: 'ocean',
    title: 'Ocean',
    preview: ['#0284C7', '#ECFEFF', '#0C4A6E'],
    theme: {
      overlayColor: '#082F49',
      closeButtonBorderColor: '#38BDF8',
      closeIconColor: '#38BDF8',
      carouselDotActiveColor: '#0284C7',
      carouselDotInactiveColor: '#BFDBFE',
      textCardBackgroundColor: '#ECFEFF',
      titleColor: '#155E75',
      messageColor: '#0C4A6E',
      checkRowBackgroundColor: '#0F172A',
      checkTextColor: '#E0F2FE',
    },
  },
  {
    id: 'forest',
    title: 'Forest',
    preview: ['#16A34A', '#F0FDF4', '#14532D'],
    theme: {
      overlayColor: '#052E16',
      closeButtonBorderColor: '#4ADE80',
      closeIconColor: '#4ADE80',
      carouselDotActiveColor: '#16A34A',
      carouselDotInactiveColor: '#BBF7D0',
      textCardBackgroundColor: '#F0FDF4',
      titleColor: '#166534',
      messageColor: '#14532D',
      checkRowBackgroundColor: '#14532D',
      checkTextColor: '#DCFCE7',
    },
  },
];

const OVERLAY_OPACITY_OPTIONS = [0.45, 0.65, 0.85] as const;
const TEXT_CARD_RADIUS_OPTIONS = [12, 20, 28] as const;

export const ThemeDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('theme');
  const { storage, reset } = useMemoryStorage();
  const [paletteId, setPaletteId] = useState<string>('sunrise');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65);
  const [textCardRadius, setTextCardRadius] = useState<number>(20);

  const selectedPalette = useMemo<ThemePalette>(
    () => THEME_PALETTES.find(palette => palette.id === paletteId) ?? THEME_PALETTES[0]!,
    [paletteId],
  );

  const theme = useMemo<RichModalTheme>(
    () => ({
      ...selectedPalette.theme,
      overlayOpacity,
    }),
    [overlayOpacity, selectedPalette.theme],
  );

  const styleOverrides = useMemo<RichModalStyleOverrides>(
    () => ({
      closeButton: {
        borderWidth: 2,
      },
      textCard: {
        borderRadius: textCardRadius,
        paddingVertical: 16,
      },
      title: {
        letterSpacing: 0.4,
      },
      message: {
        lineHeight: 20,
      },
      checkRow: {
        paddingHorizontal: 18,
      },
    }),
    [textCardRadius],
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
      title="Theme and style overrides"
      description="Change palette and style options, then replay to test RichModal behavior with your own look."
      actions={actions}>
      {/* Interactive controls for testing theme props quickly. */}
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>color palette</Text>
        <View style={styles.paletteSelectorRow}>
          {THEME_PALETTES.map(palette => {
            const isActive = palette.id === paletteId;

            return (
              <Pressable
                key={palette.id}
                onPress={() => setPaletteId(palette.id)}
                style={[styles.paletteButton, isActive ? styles.paletteButtonActive : null]}>
                <Text style={styles.paletteButtonTitle}>{palette.title}</Text>
                <View style={styles.palettePreviewRow}>
                  {palette.preview.map(color => (
                    <View key={color} style={[styles.palettePreviewDot, { backgroundColor: color }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>overlay opacity</Text>
        <View style={styles.modeSelectorRow}>
          {OVERLAY_OPACITY_OPTIONS.map(value => {
            const isActive = overlayOpacity === value;
            const label = `${Math.round(value * 100)}%`;

            return (
              <Pressable
                key={label}
                onPress={() => setOverlayOpacity(value)}
                style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
                <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>text card radius</Text>
        <View style={styles.modeSelectorRow}>
          {TEXT_CARD_RADIUS_OPTIONS.map(value => {
            const isActive = textCardRadius === value;
            const label = `${value}px`;

            return (
              <Pressable
                key={label}
                onPress={() => setTextCardRadius(value)}
                style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
                <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <RichModal
        key={modalKey}
        popups={THEMED_POPUPS}
        visible={visible}
        langCode="en"
        resolveImage={resolveImage}
        safeAreaInsets={insets}
        storage={storage}
        closeIcon={DiamondIcon}
        checkboxCheckedIcon={DotIcon}
        checkboxUncheckedIcon={CircleIcon}
        theme={theme}
        styleOverrides={styleOverrides}
      />
    </DemoCard>
  );
};
