import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import type { RendererProps } from '../types';
import { PieChart } from './PieChart';

export type FractionCompareAnswer = '<' | '>' | '=';

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface FractionComparePayload {
  left: Fraction;
  right: Fraction;
  showVisual: boolean;
  correct: FractionCompareAnswer;
  allowEquals: boolean;
}

const PIE_SIZE = 110;
const PIE_COLORS = ['#FF6B9D', '#4ECDC4'];

export function Renderer({ task, onAnswer, disabled }: RendererProps<FractionCompareAnswer>) {
  const payload = task.payload as FractionComparePayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: FractionCompareAnswer) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;
  const symbols: FractionCompareAnswer[] = payload.allowEquals ? ['<', '=', '>'] : ['<', '>'];

  return (
    <View style={styles.wrap}>
      <View style={styles.exprBox}>
        <FractionColumn fraction={payload.left} showVisual={payload.showVisual} color={PIE_COLORS[0]} />
        <View style={styles.slot}>
          <AppText style={styles.slotText}>?</AppText>
        </View>
        <FractionColumn fraction={payload.right} showVisual={payload.showVisual} color={PIE_COLORS[1]} />
      </View>

      <View style={styles.buttonsRow}>
        {symbols.map((s) => (
          <Pressable
            key={s}
            style={({ pressed }) => [
              styles.button,
              isDisabled && styles.buttonDisabled,
              pressed && !isDisabled && styles.buttonPressed,
            ]}
            onPress={() => handlePress(s)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={s}
            hitSlop={4}
          >
            <AppText style={styles.buttonText}>{s}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FractionColumn({
  fraction,
  showVisual,
  color,
}: {
  fraction: Fraction;
  showVisual: boolean;
  color: string;
}) {
  return (
    <View style={styles.fractionCol}>
      {showVisual ? (
        <PieChart numerator={fraction.numerator} denominator={fraction.denominator} size={PIE_SIZE} color={color} />
      ) : null}
      <View style={styles.fractionNumber}>
        <AppText style={styles.fracTop}>{fraction.numerator}</AppText>
        <View style={styles.fracBar} />
        <AppText style={styles.fracBottom}>{fraction.denominator}</AppText>
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
  exprBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 200,
    ...shadows.card,
  },
  fractionCol: {
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  fractionNumber: {
    alignItems: 'center',
    gap: 2,
  },
  fracTop: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  fracBar: {
    height: 3,
    width: 40,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  fracBottom: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  slot: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: {
    fontSize: 36,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 56,
    lineHeight: 68,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
});
