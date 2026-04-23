import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, shadows } from '../../constants/theme';
import type { RendererProps } from '../types';

export type RecognizeDigitMode = 'digit-to-qty' | 'qty-to-digit';

export interface RecognizeDigitPayload {
  mode: RecognizeDigitMode;
  correctNumber: number;
  candidates: number[];
}

export type RecognizeDigitAnswer = number;

const APPLE = '🍎';

function renderApples(n: number) {
  return APPLE.repeat(n);
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<RecognizeDigitAnswer>) {
  const p = task.payload as RecognizeDigitPayload;

  return (
    <View style={styles.container}>
      <View style={styles.promptBox}>
        {p.mode === 'digit-to-qty' ? (
          <AppText style={styles.bigDigit}>{p.correctNumber}</AppText>
        ) : (
          <AppText style={styles.bigApples} numberOfLines={3}>
            {renderApples(p.correctNumber)}
          </AppText>
        )}
      </View>

      <View style={styles.optionsRow}>
        {p.candidates.map((n) => (
          <Pressable
            key={n}
            style={[styles.option, !!disabled && styles.optionDisabled]}
            disabled={!!disabled}
            onPress={() => onAnswer(n)}
          >
            {p.mode === 'digit-to-qty' ? (
              <AppText style={styles.optionApples} numberOfLines={2}>
                {renderApples(n)}
              </AppText>
            ) : (
              <AppText style={styles.optionDigit}>{n}</AppText>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  promptBox: {
    flex: 1,
    maxHeight: 260,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    ...shadows.card,
  },
  bigDigit: {
    fontSize: 180,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 200,
  },
  bigApples: {
    fontSize: 44,
    textAlign: 'center',
    lineHeight: 56,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    minHeight: 110,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    ...shadows.card,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionDigit: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.text,
  },
  optionApples: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 30,
  },
});
