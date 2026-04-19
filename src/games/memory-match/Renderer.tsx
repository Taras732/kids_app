import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type MemoryAnswer = number;

export interface MemoryCard {
  id: string;
  emoji: string;
  pairKey: string;
}

export interface MemoryPayload {
  cards: MemoryCard[];
}

const FLIP_BACK_DELAY_MS = 900;

export function Renderer({ task, onAnswer, disabled }: RendererProps<MemoryAnswer>) {
  const payload = task.payload as MemoryPayload;
  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    setRevealed([]);
    setMatched(new Set());
    setMistakes(0);
    setEvaluating(false);
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    if (matched.size !== payload.cards.length) return;
    if (submittedRef.current) return;
    submittedRef.current = true;
    onAnswer(mistakes);
  }, [matched, mistakes, payload.cards.length, onAnswer]);

  const handlePress = (index: number) => {
    if (disabled || evaluating) return;
    if (matched.has(index)) return;
    if (revealed.includes(index)) return;
    if (revealed.length >= 2) return;

    const next = [...revealed, index];
    setRevealed(next);

    if (next.length !== 2) return;

    const [a, b] = next;
    const cardA = payload.cards[a];
    const cardB = payload.cards[b];

    if (cardA.pairKey === cardB.pairKey) {
      setMatched((prev) => {
        const s = new Set(prev);
        s.add(a);
        s.add(b);
        return s;
      });
      setRevealed([]);
      return;
    }

    setEvaluating(true);
    setTimeout(() => {
      setRevealed([]);
      setMistakes((m) => m + 1);
      setEvaluating(false);
    }, FLIP_BACK_DELAY_MS);
  };

  const prompt = t('game.memoryMatch.prompt');
  const row1 = payload.cards.slice(0, 3);
  const row2 = payload.cards.slice(3, 6);

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
        <AppText style={styles.counter}>
          {t('game.memoryMatch.mistakesLabel')}: {mistakes}
        </AppText>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          {row1.map((card, idx) => (
            <MemoryCardView
              key={card.id}
              card={card}
              index={idx}
              state={cardState(idx, revealed, matched)}
              onPress={() => handlePress(idx)}
              disabled={disabled || evaluating}
            />
          ))}
        </View>
        <View style={styles.row}>
          {row2.map((card, i) => {
            const idx = i + 3;
            return (
              <MemoryCardView
                key={card.id}
                card={card}
                index={idx}
                state={cardState(idx, revealed, matched)}
                onPress={() => handlePress(idx)}
                disabled={disabled || evaluating}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

type CardState = 'hidden' | 'revealed' | 'matched';

function cardState(index: number, revealed: number[], matched: Set<number>): CardState {
  if (matched.has(index)) return 'matched';
  if (revealed.includes(index)) return 'revealed';
  return 'hidden';
}

interface MemoryCardViewProps {
  card: MemoryCard;
  index: number;
  state: CardState;
  onPress: () => void;
  disabled: boolean;
}

function MemoryCardView({ card, state, onPress, disabled }: MemoryCardViewProps) {
  const showFace = state !== 'hidden';
  const isMatched = state === 'matched';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        showFace && styles.cardFace,
        isMatched && styles.cardMatched,
        pressed && !disabled && !showFace && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={disabled || showFace}
      accessibilityRole="button"
      accessibilityLabel={showFace ? card.emoji : 'hidden card'}
      hitSlop={4}
    >
      <AppText style={showFace ? styles.emojiFace : styles.emojiBack}>
        {showFace ? card.emoji : '?'}
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 72,
  },
  prompt: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  counter: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
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
    minHeight: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardMatched: {
    borderColor: colors.success,
    borderWidth: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primary,
  },
  emojiFace: {
    fontSize: 52,
    lineHeight: 62,
  },
  emojiBack: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
});
