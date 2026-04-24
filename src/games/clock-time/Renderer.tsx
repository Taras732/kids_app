import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import type { RendererProps } from '../types';
import { ClockFace } from './ClockFace';

export type ClockMode = 'clock-to-digital' | 'digital-to-clock';

export interface ClockTime {
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface ClockTimePayload {
  mode: ClockMode;
  target: ClockTime;
  choices: ClockTime[];
  use24h: boolean;
}

export type ClockTimeAnswer = string; // "HH:MM" key

const BIG_CLOCK_SIZE = 180;
const SMALL_CLOCK_SIZE = 100;

function formatTime(time: ClockTime, use24h: boolean): string {
  const h = use24h ? time.hour : time.hour % 12 === 0 ? 12 : time.hour % 12;
  const mm = time.minute.toString().padStart(2, '0');
  return `${h}:${mm}`;
}

function timeKey(time: ClockTime): string {
  return `${time.hour}:${time.minute}`;
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<ClockTimeAnswer>) {
  const payload = task.payload as ClockTimePayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (choice: ClockTime) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(timeKey(choice));
  };

  const isDisabled = disabled || locked;

  if (payload.mode === 'clock-to-digital') {
    return (
      <View style={styles.wrap}>
        <View style={styles.promptBoxClock}>
          <ClockFace hour={payload.target.hour} minute={payload.target.minute} size={BIG_CLOCK_SIZE} />
        </View>
        <AppText style={styles.prompt}>Котра година?</AppText>
        <View style={styles.choicesGridDigital}>
          {payload.choices.map((c) => (
            <Pressable
              key={timeKey(c)}
              style={[styles.digitalBtn, isDisabled && styles.disabled]}
              onPress={() => handlePress(c)}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel={formatTime(c, payload.use24h)}
              hitSlop={4}
            >
              <AppText style={styles.digitalText}>{formatTime(c, payload.use24h)}</AppText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // digital-to-clock
  return (
    <View style={styles.wrap}>
      <View style={styles.promptBoxDigital}>
        <AppText style={styles.digitalPrompt}>{formatTime(payload.target, payload.use24h)}</AppText>
      </View>
      <AppText style={styles.prompt}>Знайди годинник</AppText>
      <View style={styles.choicesGridClock}>
        {payload.choices.map((c) => (
          <Pressable
            key={timeKey(c)}
            style={[styles.clockBtn, isDisabled && styles.disabled]}
            onPress={() => handlePress(c)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={formatTime(c, payload.use24h)}
            hitSlop={4}
          >
            <ClockFace hour={c.hour} minute={c.minute} size={SMALL_CLOCK_SIZE} showNumbers={false} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  promptBoxClock: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  promptBoxDigital: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    ...shadows.card,
  },
  digitalPrompt: {
    fontSize: 72,
    lineHeight: 82,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  prompt: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  choicesGridDigital: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  digitalBtn: {
    width: '45%',
    minHeight: 70,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  digitalText: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  choicesGridClock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  clockBtn: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xs,
    ...shadows.card,
  },
  disabled: {
    opacity: 0.5,
  },
});
