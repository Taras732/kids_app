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
  memorizeMs: number;
  inputTimeLimitSec?: number;
}

type Phase = 'memorize' | 'detect';

function itemsPerRow(count: number): number {
  if (count <= 3) return 3;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<ChangedAnswer>) {
  const payload = task.payload as ChangedPayload;
  const [phase, setPhase] = useState<Phase>('memorize');
  const [locked, setLocked] = useState(false);
  const memorizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    setPhase('memorize');
    setLocked(false);
    lockedRef.current = false;
    if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);
    if (inputTimerRef.current) clearTimeout(inputTimerRef.current);
    memorizeTimerRef.current = setTimeout(() => setPhase('detect'), payload.memorizeMs);
    return () => {
      if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);
      if (inputTimerRef.current) clearTimeout(inputTimerRef.current);
    };
  }, [task.id, payload.memorizeMs]);

  useEffect(() => {
    if (phase !== 'detect' || !payload.inputTimeLimitSec) return;
    if (inputTimerRef.current) clearTimeout(inputTimerRef.current);
    inputTimerRef.current = setTimeout(() => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setLocked(true);
      onAnswer(-1);
    }, payload.inputTimeLimitSec * 1000);
    return () => {
      if (inputTimerRef.current) clearTimeout(inputTimerRef.current);
    };
  }, [phase, payload.inputTimeLimitSec, onAnswer]);

  const handlePress = (index: number) => {
    if (disabled || locked || phase !== 'detect') return;
    lockedRef.current = true;
    setLocked(true);
    onAnswer(index);
  };

  const emojis = phase === 'memorize' ? payload.before : payload.after;
  const prompt =
    phase === 'memorize' ? t('game.whatsChanged.memorize') : t('game.whatsChanged.detect');
  const canTap = phase === 'detect' && !locked && !disabled;
  const perRow = itemsPerRow(emojis.length);
  const widthPct = `${Math.floor(100 / perRow) - 3}%` as `${number}%`;
  const glyphSize = emojis.length <= 4 ? 56 : emojis.length <= 6 ? 48 : 40;

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
      </View>

      <View style={styles.grid}>
        {emojis.map((emoji, idx) => (
          <ItemCard
            key={idx}
            emoji={emoji}
            highlight={phase === 'memorize'}
            onPress={() => handlePress(idx)}
            disabled={!canTap}
            width={widthPct}
            glyphSize={glyphSize}
          />
        ))}
      </View>
    </View>
  );
}

interface ItemCardProps {
  emoji: string;
  highlight: boolean;
  onPress: () => void;
  disabled: boolean;
  width: `${number}%`;
  glyphSize: number;
}

function ItemCard({ emoji, highlight, onPress, disabled, width, glyphSize }: ItemCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width },
        highlight && styles.cardMemorize,
        pressed && !disabled && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={emoji}
      hitSlop={4}
    >
      <AppText style={[styles.emoji, { fontSize: glyphSize, lineHeight: glyphSize + 10 }]}>
        {emoji}
      </AppText>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    justifyContent: 'center',
    alignContent: 'center',
  },
  card: {
    minHeight: 100,
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
});
