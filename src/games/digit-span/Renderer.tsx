import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { NumberKeypad } from '../../components/game/NumberKeypad';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export interface DigitSpanPayload {
  sequence: number[];
  showEachMs: number;
  gapMs: number;
  inputTimeLimitSec?: number;
}

export type DigitSpanAnswer = number[];

type Phase = 'showing' | 'input';

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<DigitSpanAnswer>) {
  const payload = task.payload as DigitSpanPayload;
  const [phase, setPhase] = useState<Phase>('showing');
  const [showIdx, setShowIdx] = useState<number>(-1);
  const [input, setInput] = useState('');
  const submittedRef = useRef(false);

  useEffect(() => {
    setPhase('showing');
    setShowIdx(-1);
    setInput('');
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    if (phase !== 'showing') return;
    let cancelled = false;
    (async () => {
      // small initial gap so kid sees transition
      await wait(300);
      if (cancelled) return;
      for (let i = 0; i < payload.sequence.length; i++) {
        if (cancelled) return;
        setShowIdx(i);
        await wait(payload.showEachMs);
        if (cancelled) return;
        setShowIdx(-1);
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
    const t = setTimeout(() => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onAnswer(input.split('').map((c) => Number(c)));
    }, payload.inputTimeLimitSec * 1000);
    return () => clearTimeout(t);
  }, [phase, payload.inputTimeLimitSec, onAnswer, input]);

  const handleDigit = (d: string) => {
    if (phase !== 'input' || disabled || submittedRef.current) return;
    if (input.length >= payload.sequence.length) return;
    setInput(input + d);
  };

  const handleDelete = () => {
    if (phase !== 'input' || disabled || submittedRef.current) return;
    setInput(input.slice(0, -1));
  };

  const handleOk = () => {
    if (phase !== 'input' || disabled || submittedRef.current) return;
    if (input.length !== payload.sequence.length) return;
    submittedRef.current = true;
    onAnswer(input.split('').map((c) => Number(c)));
  };

  if (phase === 'showing') {
    return (
      <View style={styles.wrap}>
        <AppText style={styles.prompt}>{t('game.digitSpan.memorize')}</AppText>
        <View style={styles.digitBox}>
          {showIdx >= 0 ? (
            <AppText style={styles.bigDigit}>{payload.sequence[showIdx]}</AppText>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <AppText style={styles.prompt}>{t('game.digitSpan.repeat')}</AppText>
      <AppText style={styles.counter}>
        {input.length} / {payload.sequence.length}
      </AppText>
      <NumberKeypad
        value={input}
        onDigit={handleDigit}
        onDelete={handleDelete}
        onOk={handleOk}
        okDisabled={input.length !== payload.sequence.length}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  prompt: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  counter: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  digitBox: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  bigDigit: {
    fontSize: 180,
    lineHeight: 200,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
});
