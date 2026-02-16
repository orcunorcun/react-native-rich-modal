import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RichModal } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { resolveImage } from '../data/images';
import { LANGUAGE_POPUPS } from '../data/popups';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

type LangOption = 'en' | 'ja' | 'cht';

const LANGUAGE_OPTIONS: LangOption[] = ['en', 'ja', 'cht'];

export const LanguageDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('language');
  const [langCode, setLangCode] = useState<LangOption>('en');

  const actions = useMemo(() => <DemoActionButton title="Play popup" onPress={replay} />, [replay]);

  return (
    <DemoCard
      title="Language switching demo"
      description="Switch langCode and replay. This demo includes localized url/title/message plus image-level overrides."
      actions={actions}>
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>langCode</Text>
        <View style={styles.modeSelectorRow}>
          {LANGUAGE_OPTIONS.map(option => {
            const isActive = langCode === option;

            return (
              <Pressable
                key={option}
                onPress={() => setLangCode(option)}
                style={[styles.modeSelectorButton, isActive ? styles.modeSelectorButtonActive : null]}>
                <Text style={[styles.modeSelectorButtonText, isActive ? styles.modeSelectorButtonTextActive : null]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.storageInfo}>Current language: {langCode}</Text>

      <RichModal
        key={`${modalKey}-${langCode}`}
        popups={LANGUAGE_POPUPS}
        visible={visible}
        langCode={langCode}
        resolveImage={resolveImage}
        safeAreaInsets={insets}
      />
    </DemoCard>
  );
};
