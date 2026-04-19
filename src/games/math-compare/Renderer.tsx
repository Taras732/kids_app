import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import type { RendererProps } from '../types';

export type CompareAnswer = '>' | '<' | '=';

export interface ComparePayload {
  a: number;
  b: number;
  correct: CompareAnswer;
}

const SYMBOLS: CompareAnswer[] = ['<', '=', '>'];

export function Renderer({ task, onAnswer, disabled }: RendererProps<CompareAnswer>) {
  const payload = task.payload as ComparePayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: CompareAnswer) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.expressionBox}>
        <AppText style={styles.number}>{payload.a}</AppText>
        <View style={styles.slot}>
          <AppText style={styles.slotDash}>?</AppText>
        </View>
        <AppText style={styles.number}>{payload.b}</AppText>
      </View>

      <View style={styles.buttonsRow}>
        {SYMBOLS.map((symbol) => (
          <SymbolButton
            key={symbol}
            symbol={symbol}
            onPress={() => handlePress(symbol)}
            disabled={isDisabled}
          />
        ))}
      </View>
    </View>
  );
}

interface SymbolButtonProps {
  symbol: CompareAnswer;
  onPress: () => void;
  disabled: boolean;
}

function SymbolButton({ symbol, onPress, disabled }: SymbolButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={symbol}
      hitSlop={4}
    >
      <AppText style={styles.buttonText} color={disabled ? colors.textDisabled : colors.text}>
        {symbol}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    minHeight: 160,
  },
  number: {
    fontSize: 72,
    lineHeight: 84,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  slot: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotDash: {
    fontSize: 40,
    lineHeight: 48,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 56,
    lineHeight: 68,
    fontFamily: fontFamily.extraBold,
  },
});
