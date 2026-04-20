import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type BreathingAnswer = true;
export type BreathPhase = 'inhale' | 'hold' | 'exhale';

export interface BreathingPayload {
  breathNum: number;
  total: number;
}

const INHALE_MS = 3000;
const HOLD_MS = 500;
const EXHALE_MS = 3000;

export function Renderer({ task, onAnswer, disabled }: RendererProps<BreathingAnswer>) {
  const payload = task.payload as BreathingPayload;
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const scaleRef = useRef(new Animated.Value(1));
  const scale = scaleRef.current;

  const onAnswerRef = useRef(onAnswer);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setPhase('inhale');
    scale.setValue(1);

    Animated.timing(scale, {
      toValue: 1.6,
      duration: INHALE_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    timers.push(
      setTimeout(() => {
        if (!cancelled) setPhase('hold');
      }, INHALE_MS),
    );

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setPhase('exhale');
        Animated.timing(scale, {
          toValue: 1,
          duration: EXHALE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
      }, INHALE_MS + HOLD_MS),
    );

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        if (!disabledRef.current) {
          onAnswerRef.current(true);
        }
      }, INHALE_MS + HOLD_MS + EXHALE_MS),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [task.id, scale]);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Animated.Text style={[styles.balloon, { transform: [{ scale }] }]}>
          🎈
        </Animated.Text>
        <AppText style={styles.phase}>
          {t(`game.breathing.phases.${phase}`)}
        </AppText>
      </View>

      <View style={styles.counterBox}>
        <AppText style={styles.counter}>
          {t('game.breathing.progress', {
            current: payload.breathNum,
            total: payload.total,
          })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    minHeight: 260,
  },
  balloon: {
    fontSize: 120,
    lineHeight: 140,
  },
  phase: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  counterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
  counter: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
});
