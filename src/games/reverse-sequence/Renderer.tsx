import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors as theme, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type ReverseColor = 'red' | 'blue' | 'green' | 'yellow';

export interface ReverseSequencePayload {
  sequence: ReverseColor[];
  showEachMs: number;
  gapMs: number;
  inputTimeLimitSec?: number;
}

export type ReverseSequenceAnswer = ReverseColor[];

type Phase = 'showing' | 'input';

const COLOR_HEX: Record<ReverseColor, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#FACC15',
};

const BUTTONS: ReverseColor[] = ['red', 'blue', 'green', 'yellow'];

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<ReverseSequenceAnswer>) {
  const payload = task.payload as ReverseSequencePayload;
  const [phase, setPhase] = useState<Phase>('showing');
  const [activeShow, setActiveShow] = useState<ReverseColor | null>(null);
  const [entered, setEntered] = useState<ReverseColor[]>([]);
  const [tapFlash, setTapFlash] = useState<ReverseColor | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setPhase('showing');
    setActiveShow(null);
    setEntered([]);
    setTapFlash(null);
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    if (phase !== 'showing') return;
    let cancelled = false;
    (async () => {
      await wait(300);
      if (cancelled) return;
      for (const c of payload.sequence) {
        if (cancelled) return;
        setActiveShow(c);
        await wait(payload.showEachMs);
        if (cancelled) return;
        setActiveShow(null);
        await wait(payload.gapMs);
      }
      if (!cancelled) setPhase('input');
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, task.id, payload.sequence, payload.showEachMs, payload.gapMs]);

  useEffect(() => {
    if (phase !== 'input' || !payload.inputTimeLimitSec) return;
    const timer = setTimeout(() => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onAnswer(entered);
    }, payload.inputTimeLimitSec * 1000);
    return () => clearTimeout(timer);
  }, [phase, payload.inputTimeLimitSec, onAnswer, entered]);

  const handleTap = (color: ReverseColor) => {
    if (phase !== 'input' || disabled || submittedRef.current) return;
    if (entered.length >= payload.sequence.length) return;

    setTapFlash(color);
    setTimeout(() => setTapFlash(null), 180);

    const next = [...entered, color];
    setEntered(next);
    if (next.length === payload.sequence.length) {
      submittedRef.current = true;
      setTimeout(() => onAnswer(next), 220);
    }
  };

  const promptText =
    phase === 'showing'
      ? t('game.reverseSequence.memorize')
      : t('game.reverseSequence.reverse');

  return (
    <View style={styles.wrap}>
      <AppText style={styles.prompt}>{promptText}</AppText>

      <View style={styles.progressRow}>
        {Array.from({ length: payload.sequence.length }).map((_, i) => {
          const filled = entered[i];
          return (
            <View
              key={i}
              style={[
                styles.progressDot,
                filled ? { backgroundColor: COLOR_HEX[filled] } : styles.progressDotEmpty,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.grid}>
        {BUTTONS.map((color) => {
          const isLit =
            (phase === 'showing' && activeShow === color) ||
            (phase === 'input' && tapFlash === color);
          const dimForShow = phase === 'showing' && !isLit;
          const isTappable = phase === 'input' && !disabled && entered.length < payload.sequence.length;
          return (
            <Pressable
              key={color}
              style={[
                styles.button,
                {
                  backgroundColor: COLOR_HEX[color],
                  opacity: dimForShow ? 0.3 : isLit ? 1 : 0.9,
                  transform: [{ scale: isLit ? 1.05 : 1 }],
                },
              ]}
              onPress={() => handleTap(color)}
              disabled={!isTappable}
              accessibilityRole="button"
              accessibilityLabel={color}
              hitSlop={4}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  prompt: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: theme.text,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  progressDotEmpty: {
    backgroundColor: theme.border,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: radius.xl,
    ...shadows.cardRaised,
  },
});
