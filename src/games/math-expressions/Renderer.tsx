import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import type { RendererProps } from '../types';

export type ExprOp = '+' | '−';

export interface ExprPayload {
  a: number;
  b: number;
  op: ExprOp;
  correct: number;
  choices: number[];
}

export type ExprAnswer = number;

export function Renderer({ task, onAnswer, disabled }: RendererProps<ExprAnswer>) {
  const payload = task.payload as ExprPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: number) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;
  const [row1, row2] = [payload.choices.slice(0, 2), payload.choices.slice(2, 4)];

  return (
    <View style={styles.wrap}>
      <View style={styles.expressionBox}>
        <AppText style={styles.expression}>
          {payload.a} {payload.op} {payload.b} = ?
        </AppText>
      </View>

      <View style={styles.choicesGrid}>
        <View style={styles.row}>
          {row1.map((value, idx) => (
            <ChoiceButton
              key={`r1-${idx}`}
              value={value}
              onPress={() => handlePress(value)}
              disabled={isDisabled}
            />
          ))}
        </View>
        <View style={styles.row}>
          {row2.map((value, idx) => (
            <ChoiceButton
              key={`r2-${idx}`}
              value={value}
              onPress={() => handlePress(value)}
              disabled={isDisabled}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface ChoiceButtonProps {
  value: number;
  onPress: () => void;
  disabled: boolean;
}

function ChoiceButton({ value, onPress, disabled }: ChoiceButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.choice,
        disabled && styles.choiceDisabled,
        pressed && !disabled && styles.choicePressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={String(value)}
      hitSlop={4}
    >
      <AppText style={styles.choiceText} color={disabled ? colors.textDisabled : colors.text}>
        {value}
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
  expressionBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  expression: {
    fontSize: 56,
    lineHeight: 68,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  choicesGrid: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  choice: {
    flex: 1,
    minHeight: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choicePressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  choiceText: {
    fontSize: 40,
    fontFamily: fontFamily.extraBold,
  },
});
