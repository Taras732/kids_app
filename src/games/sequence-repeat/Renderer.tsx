import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type SequenceAnswer = number[];

export interface SequencePayload {
  sequence: number[];
}

const BUTTON_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#FACC15'];
const HIGHLIGHT_ON_MS = 700;
const HIGHLIGHT_OFF_MS = 200;
const PLAYBACK_START_DELAY_MS = 500;

type Phase = 'playback' | 'input';

export function Renderer({ task, onAnswer, disabled }: RendererProps<SequenceAnswer>) {
  const payload = task.payload as SequencePayload;
  const [phase, setPhase] = useState<Phase>('playback');
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const submittedRef = useRef(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    setPhase('playback');
    setHighlightedIdx(null);
    setUserSequence([]);
    submittedRef.current = false;
    clearTimers();

    const sequence = payload.sequence;
    let offset = PLAYBACK_START_DELAY_MS;

    sequence.forEach((idx) => {
      const onTimer = setTimeout(() => setHighlightedIdx(idx), offset);
      offset += HIGHLIGHT_ON_MS;
      const offTimer = setTimeout(() => setHighlightedIdx(null), offset);
      offset += HIGHLIGHT_OFF_MS;
      timersRef.current.push(onTimer, offTimer);
    });

    const inputTimer = setTimeout(() => setPhase('input'), offset);
    timersRef.current.push(inputTimer);

    return () => clearTimers();
  }, [task.id, payload.sequence]);

  useEffect(() => {
    if (phase !== 'input') return;
    if (userSequence.length !== payload.sequence.length) return;
    if (submittedRef.current) return;
    submittedRef.current = true;
    onAnswer(userSequence);
  }, [userSequence, phase, payload.sequence.length, onAnswer]);

  const handlePress = (idx: number) => {
    if (disabled || phase !== 'input') return;
    if (userSequence.length >= payload.sequence.length) return;
    setUserSequence((prev) => [...prev, idx]);
    setHighlightedIdx(idx);
    const clearTimer = setTimeout(() => setHighlightedIdx(null), 200);
    timersRef.current.push(clearTimer);
  };

  const prompt =
    phase === 'playback' ? t('game.sequenceRepeat.watch') : t('game.sequenceRepeat.yourTurn');
  const isInput = phase === 'input';

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
        <AppText style={styles.counter}>
          {userSequence.length} / {payload.sequence.length}
        </AppText>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          {[0, 1].map((i) => (
            <ColorButton
              key={i}
              index={i}
              color={BUTTON_COLORS[i]}
              highlighted={highlightedIdx === i}
              onPress={() => handlePress(i)}
              disabled={!isInput || !!disabled}
            />
          ))}
        </View>
        <View style={styles.row}>
          {[2, 3].map((i) => (
            <ColorButton
              key={i}
              index={i}
              color={BUTTON_COLORS[i]}
              highlighted={highlightedIdx === i}
              onPress={() => handlePress(i)}
              disabled={!isInput || !!disabled}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface ColorButtonProps {
  index: number;
  color: string;
  highlighted: boolean;
  onPress: () => void;
  disabled: boolean;
}

function ColorButton({ index, color, highlighted, onPress, disabled }: ColorButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: highlighted ? 1 : 0.55 },
        highlighted && styles.buttonHighlighted,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`color-${index}`}
      hitSlop={4}
    />
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
    minHeight: 80,
  },
  prompt: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  counter: {
    fontSize: 16,
    lineHeight: 20,
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
  button: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 100,
  },
  buttonHighlighted: {
    borderColor: colors.text,
    transform: [{ scale: 1.04 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
  },
});
