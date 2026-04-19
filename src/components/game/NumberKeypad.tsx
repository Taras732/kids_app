import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';

interface NumberKeypadProps {
  value: string;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onOk: () => void;
  okDisabled?: boolean;
  disabled?: boolean;
}

const ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export function NumberKeypad({
  value,
  onDigit,
  onDelete,
  onOk,
  okDisabled = false,
  disabled = false,
}: NumberKeypadProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.display}>
        <AppText style={styles.displayText} color={value ? colors.text : colors.textDisabled}>
          {value || '—'}
        </AppText>
      </View>

      <View style={styles.grid}>
        {ROWS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((d) => (
              <KeypadKey
                key={d}
                label={d}
                onPress={() => onDigit(d)}
                disabled={disabled}
              />
            ))}
          </View>
        ))}
        <View style={styles.row}>
          <KeypadKey
            label="⌫"
            onPress={onDelete}
            disabled={disabled || value.length === 0}
            variant="ghost"
          />
          <KeypadKey
            label="0"
            onPress={() => onDigit('0')}
            disabled={disabled}
          />
          <KeypadKey
            label="OK"
            onPress={onOk}
            disabled={disabled || okDisabled}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

interface KeypadKeyProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'ghost';
}

function KeypadKey({ label, onPress, disabled, variant = 'default' }: KeypadKeyProps) {
  const keyStyles = [
    styles.key,
    variant === 'primary' && styles.keyPrimary,
    variant === 'ghost' && styles.keyGhost,
    disabled && styles.keyDisabled,
  ];
  const textColor =
    variant === 'primary' && !disabled
      ? '#FFFFFF'
      : disabled
      ? colors.textDisabled
      : colors.text;

  return (
    <Pressable
      style={({ pressed }) => [...keyStyles, pressed && !disabled && styles.keyPressed]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
    >
      <AppText style={styles.keyText} color={textColor}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  display: {
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  displayText: {
    fontSize: 36,
    fontFamily: fontFamily.extraBold,
  },
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  key: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  keyGhost: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.surfaceSoft,
  },
  keyDisabled: {
    opacity: 0.5,
  },
  keyPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  keyText: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
  },
});
