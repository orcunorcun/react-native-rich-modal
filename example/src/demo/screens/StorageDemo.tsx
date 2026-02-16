import { useMemo } from 'react';
import { Text } from 'react-native';
import { RichModal } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { resolveImage } from '../data/images';
import { STORAGE_POPUPS } from '../data/popups';
import { useMemoryStorage } from '../hooks/useMemoryStorage';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

export const StorageDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('storage');
  const { storage, snapshot, reset } = useMemoryStorage();
  const labels = useMemo(
    () => ({
      dontShowAgain: 'Dont show again (stored)',
    }),
    [],
  );
  const actions = useMemo(
    () => (
      <>
        <DemoActionButton title="Play popup" onPress={replay} />
        <DemoActionButton title="Clear storage" onPress={reset} />
      </>
    ),
    [replay, reset],
  );

  const entries = Object.entries(snapshot);
  const snapshotText =
    entries.length === 0 ? 'Storage is empty.' : entries.map(([key, value]) => `${key}: ${String(value)}`).join(' | ');

  return (
    <DemoCard
      title="Storage adapter example"
      description={'This demo passes a storage adapter to persist "Dont show again" per popup id.'}
      actions={actions}>
      <Text style={styles.storageInfo}>{snapshotText}</Text>
      <RichModal
        key={modalKey}
        popups={STORAGE_POPUPS}
        visible={visible}
        langCode="en"
        resolveImage={resolveImage}
        safeAreaInsets={insets}
        storage={storage}
        labels={labels}
      />
    </DemoCard>
  );
};
