import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
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
  totalPairs: number;
}

const FLIP_BACK_DELAY_MS = 700;

const GRADIENT_BACK: readonly [string, string] = ['#6C5CE7', '#8B7CF6'];
const GRADIENT_MATCHED: readonly [string, string] = ['#22C55E', '#16A34A'];

export function Renderer({ task, onAnswer, disabled }: RendererProps<MemoryAnswer>) {
  const payload = task.payload as MemoryPayload;
  const totalPairs = payload.totalPairs;

  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const submittedRef = useRef(false);
  const onAnswerRef = useRef(onAnswer);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    setRevealed([]);
    setMatched(new Set());
    setMoves(0);
    setMistakes(0);
    setElapsed(0);
    setEvaluating(false);
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (submittedRef.current) return;
      setElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [task.id]);

  useEffect(() => {
    if (matched.size !== payload.cards.length) return;
    if (submittedRef.current) return;
    submittedRef.current = true;
    onAnswerRef.current(mistakes);
  }, [matched, mistakes, payload.cards.length]);

  const handlePress = (index: number) => {
    if (disabled || evaluating) return;
    if (matched.has(index)) return;
    if (revealed.includes(index)) return;
    if (revealed.length >= 2) return;

    const next = [...revealed, index];
    setRevealed(next);
    if (next.length !== 2) return;

    setMoves((m) => m + 1);
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

  const foundPairs = matched.size / 2;
  const timeLabel = formatTime(elapsed);

  return (
    <View style={styles.wrap}>
      <View style={styles.infoBar}>
        <StatCell label={t('game.memoryMatch.movesLabel')} value={String(moves)} />
        <StatCell label={t('game.memoryMatch.foundLabel')} value={`${foundPairs}/${totalPairs}`} />
        <StatCell label={t('game.memoryMatch.timeLabel')} value={timeLabel} />
      </View>

      <View style={styles.grid}>
        {payload.cards.map((card, idx) => (
          <MemoryCardView
            key={card.id}
            card={card}
            state={cardState(idx, revealed, matched)}
            onPress={() => handlePress(idx)}
            disabled={disabled || evaluating}
          />
        ))}
      </View>
    </View>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

interface StatCellProps {
  label: string;
  value: string;
}

function StatCell({ label, value }: StatCellProps) {
  return (
    <View style={styles.statCell}>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText style={styles.statValue}>{value}</AppText>
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
        pressed && !disabled && !showFace && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={disabled || showFace}
      accessibilityRole="button"
      accessibilityLabel={showFace ? card.emoji : 'hidden card'}
      hitSlop={4}
    >
      {isMatched ? (
        <LinearGradient
          colors={GRADIENT_MATCHED}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardFill, styles.cardMatched]}
        >
          <AppText style={styles.emojiMatched}>{card.emoji}</AppText>
        </LinearGradient>
      ) : showFace ? (
        <View style={[styles.cardFill, styles.cardFace]}>
          <AppText style={styles.emojiFace}>{card.emoji}</AppText>
        </View>
      ) : (
        <LinearGradient
          colors={GRADIENT_BACK}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardFill}
        >
          <AppText style={styles.emojiBack}>?</AppText>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  card: {
    width: '23%',
    aspectRatio: 1,
  },
  cardFill: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.btn,
  },
  cardFace: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardMatched: {
    opacity: 0.75,
  },
  cardPressed: {
    transform: [{ scale: 0.95 }],
  },
  emojiFace: {
    fontSize: 32,
    lineHeight: 38,
  },
  emojiMatched: {
    fontSize: 32,
    lineHeight: 38,
  },
  emojiBack: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fontFamily.extraBold,
    color: '#FFFFFF',
  },
});
