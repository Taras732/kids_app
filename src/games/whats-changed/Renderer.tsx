import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type ChangedAnswer = number;

export interface ChangedPayload {
  before: string[];
  after: string[];
  changedIndex: number;
}

const MEMORIZE_MS = 2000;

type Phase = 'memorize' | 'detect';

export function Renderer({ task, onAnswer, disabled }: RendererProps<ChangedAnswer>) {
  const payload = task.payload as ChangedPayload;
  const [phase, setPhase] = useState<Phase>('memorize');
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase('memorize');
    setLocked(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPhase('detect'), MEMORIZE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [task.id]);

  const handlePress = (index: number) => {
    if (disabled || locked || phase !== 'detect') return;
    setLocked(true);
    onAnswer(index);
  };

  const emojis = phase === 'memorize' ? payload.before : payload.after;
  const prompt =
    phase === 'memorize' ? t('game.whatsChanged.memorize') : t('game.whatsChanged.detect');
  const canTap = phase === 'detect' && !locked && !disabled;

  const row1 = [0, 1];
  const row2 = [2, 3];

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          {row1.map((idx) => (
            <ItemCard
              key={idx}
              emoji={emojis[idx]}
              highlight={phase === 'memorize'}
              onPress={() => handlePress(idx)}
              disabled={!canTap}
            />
          ))}
        </View>
        <View style={styles.row}>
          {row2.map((idx) => (
            <ItemCard
              key={idx}
              emoji={emojis[idx]}
              highlight={phase === 'memorize'}
              onPress={() => handlePress(idx)}
              disabled={!canTap}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface ItemCardProps {
  emoji: string;
  highlight: boolean;
  onPress: () => void;
  disabled: boolean;
}

function ItemCard({ emoji, highlight, onPress, disabled }: ItemCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        highlight && styles.cardMemorize,
        pressed && !disabled && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={emoji}
      hitSlop={4}
    >
      <AppText style={styles.emoji}>{emoji}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  promptBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  prompt: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  grid: {
    flex: 1,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardMemorize: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 66,
  },
});
