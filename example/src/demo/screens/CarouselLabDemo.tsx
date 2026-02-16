import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RichModal, type PopupItemType } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { resolveImage } from '../data/images';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

type DatasetId = 'local' | 'mixed' | 'placeholder' | 'large';

type DatasetOption = {
  id: DatasetId;
  title: string;
  description: string;
};

const LOCAL_IMAGE_KEYS = ['popup/en/1.jpg', 'popup/en/2_1.jpg', 'popup/en/2_2.jpg', 'popup/en/3.jpg'] as const;
const AUTO_PLAY_INTERVAL_OPTIONS = [800, 1500, 3000, 5000] as const;

const DATASET_OPTIONS: DatasetOption[] = [
  {
    id: 'local',
    title: 'Local keys',
    description: 'Resolver-only keys.',
  },
  {
    id: 'mixed',
    title: 'Mixed keys',
    description: 'Resolver key + direct URL together.',
  },
  {
    id: 'placeholder',
    title: 'Missing slots',
    description: 'Empty/missing image keys render placeholders.',
  },
  {
    id: 'large',
    title: 'Large set',
    description: 'Many slides for stress/perf checks.',
  },
];

const getDatasetImageKeys = (datasetId: DatasetId): string[] => {
  switch (datasetId) {
    case 'local':
      return [...LOCAL_IMAGE_KEYS];
    case 'mixed':
      return [
        'popup/en/2_1.jpg',
        'https://picsum.photos/seed/rich-modal-mixed-1/460/300',
        'popup/en/2_2.jpg',
        'https://picsum.photos/seed/rich-modal-mixed-2/460/300',
      ];
    case 'placeholder':
      return [
        '',
        'popup/en/missing.jpg',
        'https://picsum.photos/seed/rich-modal-placeholder/460/300',
        'popup/en/3.jpg',
      ];
    case 'large':
      return Array.from({ length: 28 }, (_, index) => {
        if (index % 9 === 0) {
          return '';
        }
        if (index % 5 === 0) {
          return `https://picsum.photos/seed/rich-modal-large-${index}/460/300`;
        }
        if (index % 4 === 0) {
          return 'popup/en/missing.jpg';
        }
        return LOCAL_IMAGE_KEYS[index % LOCAL_IMAGE_KEYS.length]!;
      });
    default:
      return [...LOCAL_IMAGE_KEYS];
  }
};

export const CarouselLabDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('carousel-lab');
  const [datasetId, setDatasetId] = useState<DatasetId>('mixed');
  const [autoPlay, setAutoPlay] = useState(true);
  const [loop, setLoop] = useState(true);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number>(3000);

  const imageKeys = useMemo(() => getDatasetImageKeys(datasetId), [datasetId]);

  const popups = useMemo<PopupItemType[]>(
    () => [
      {
        id: `carousel-lab-${datasetId}`,
        imgSrc: imageKeys,
        title: { en: 'Carousel Lab' },
        message: {
          en: `Dataset: ${datasetId} | Slides: ${imageKeys.length}. Use controls to test autoplay/loop/placeholder/URL behavior.`,
        },
      },
    ],
    [datasetId, imageKeys],
  );

  const actions = useMemo(() => <DemoActionButton title="Play popup" onPress={replay} />, [replay]);

  return (
    <DemoCard
      title="Carousel + image fallback lab"
      description="Test autoplay/loop/interval plus resolver+URL fallback, missing placeholders and large datasets."
      actions={actions}>
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>dataset</Text>
        <View style={styles.paletteSelectorRow}>
          {DATASET_OPTIONS.map(option => {
            const isActive = option.id === datasetId;
            return (
              <Pressable
                key={option.id}
                onPress={() => setDatasetId(option.id)}
                style={[styles.paletteButton, isActive ? styles.paletteButtonActive : null]}>
                <Text style={styles.paletteButtonTitle}>{option.title}</Text>
                <Text style={styles.storageInfo}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.modeSelectorRow}>
        <Pressable
          onPress={() => setAutoPlay(prev => !prev)}
          style={[styles.modeSelectorButton, autoPlay ? styles.modeSelectorButtonActive : null]}>
          <Text style={[styles.modeSelectorButtonText, autoPlay ? styles.modeSelectorButtonTextActive : null]}>
            {autoPlay ? 'autoplay on' : 'autoplay off'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setLoop(prev => !prev)}
          style={[styles.modeSelectorButton, loop ? styles.modeSelectorButtonActive : null]}>
          <Text style={[styles.modeSelectorButtonText, loop ? styles.modeSelectorButtonTextActive : null]}>
            {loop ? 'loop on' : 'loop off'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>autoplay interval</Text>
        <View style={styles.paletteSelectorRow}>
          {AUTO_PLAY_INTERVAL_OPTIONS.map(interval => {
            const isActive = autoPlayInterval === interval;
            const label = `${interval}ms`;

            return (
              <Pressable
                key={label}
                onPress={() => setAutoPlayInterval(interval)}
                style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
                <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.storageInfo}>
        Active config: {datasetId} | slides: {imageKeys.length} | autoPlay: {String(autoPlay)} | loop: {String(loop)} |
        interval: {autoPlayInterval}ms
      </Text>

      <RichModal
        key={modalKey}
        popups={popups}
        visible={visible}
        langCode="en"
        resolveImage={resolveImage}
        safeAreaInsets={insets}
        carouselAutoPlay={autoPlay}
        carouselLoop={loop}
        carouselAutoPlayInterval={autoPlayInterval}
        labels={{ missingImage: 'Image placeholder (missing or failed)' }}
      />
    </DemoCard>
  );
};
