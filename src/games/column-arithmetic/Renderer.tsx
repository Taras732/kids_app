import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import type { RendererProps } from '../types';

export interface ColumnPayload {
  a: number;
  b: number;
  op: '+' | '−';
  correct: number;
  digitCount: number;
}

export type ColumnAnswer = number;

const CELL_WIDTH = 44;
const CELL_HEIGHT = 52;
const DIGIT_FONT = 34;

function computeAdditionCarries(a: number, b: number, digitCount: number): boolean[] {
  const aStr = String(a).padStart(digitCount, '0');
  const bStr = String(b).padStart(digitCount, '0');
  const carries = new Array(digitCount).fill(false);
  let carry = 0;
  for (let col = 0; col < digitCount; col++) {
    const idx = digitCount - 1 - col;
    const da = parseInt(aStr[idx], 10);
    const db = parseInt(bStr[idx], 10);
    const sum = da + db + carry;
    if (col + 1 < digitCount) carries[col + 1] = sum >= 10;
    carry = sum >= 10 ? 1 : 0;
  }
  return carries;
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<ColumnAnswer>) {
  const payload = task.payload as ColumnPayload;
  const [entered, setEntered] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setEntered([]);
    setLocked(false);
  }, [task.id]);

  const digitCount = payload.digitCount;
  const aStr = String(payload.a).padStart(digitCount, ' ');
  const bStr = String(payload.b).padStart(digitCount, ' ');
  const aDigits = aStr.split('');
  const bDigits = bStr.split('');

  const carries =
    payload.op === '+' ? computeAdditionCarries(payload.a, payload.b, digitCount) : [];

  const handleDigit = (d: number) => {
    if (disabled || locked) return;
    if (entered.length >= digitCount) return;
    setEntered([...entered, d]);
  };

  const handleDelete = () => {
    if (disabled || locked) return;
    if (entered.length === 0) return;
    setEntered(entered.slice(0, -1));
  };

  const handleOk = () => {
    if (disabled || locked) return;
    if (entered.length !== digitCount) return;
    setLocked(true);
    let num = 0;
    for (let i = 0; i < entered.length; i++) {
      num += entered[i] * Math.pow(10, i);
    }
    onAnswer(num);
  };

  // resultCells[0] = leftmost visual cell; entered[0] = ones digit
  const resultCells: (number | null)[] = [];
  for (let displayIdx = 0; displayIdx < digitCount; displayIdx++) {
    const enteredIdx = digitCount - 1 - displayIdx;
    resultCells.push(enteredIdx < entered.length ? entered[enteredIdx] : null);
  }
  const activeDisplayIdx = digitCount - 1 - entered.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.problemBox}>
        {/* Carry row (addition only) */}
        {payload.op === '+' ? (
          <View style={styles.row}>
            <View style={styles.cell} />
            {carries.map((c, i) => (
              <View key={i} style={styles.carryCell}>
                {c ? <AppText style={styles.carryText}>1</AppText> : null}
              </View>
            ))}
          </View>
        ) : (
          <View style={{ height: 4 }} />
        )}

        {/* Top operand */}
        <View style={styles.row}>
          <View style={styles.cell} />
          {aDigits.map((d, i) => (
            <View key={i} style={styles.cell}>
              <AppText style={styles.digitText}>{d === ' ' ? '' : d}</AppText>
            </View>
          ))}
        </View>

        {/* Operator + bottom operand */}
        <View style={styles.row}>
          <View style={styles.cell}>
            <AppText style={styles.digitText}>{payload.op}</AppText>
          </View>
          {bDigits.map((d, i) => (
            <View key={i} style={styles.cell}>
              <AppText style={styles.digitText}>{d === ' ' ? '' : d}</AppText>
            </View>
          ))}
        </View>

        {/* Separator line */}
        <View style={[styles.separator, { width: CELL_WIDTH * (digitCount + 1) - 4 }]} />

        {/* Result cells */}
        <View style={styles.row}>
          <View style={styles.cell} />
          {resultCells.map((cell, i) => (
            <View
              key={i}
              style={[
                styles.resultCell,
                i === activeDisplayIdx && !locked && styles.resultCellActive,
              ]}
            >
              {cell !== null ? <AppText style={styles.digitText}>{cell}</AppText> : null}
            </View>
          ))}
        </View>
      </View>

      {/* Keypad */}
      <View style={styles.keypadWrap}>
        <View style={styles.keypadRow}>
          {[1, 2, 3].map((d) => (
            <KeyBtn key={d} label={String(d)} onPress={() => handleDigit(d)} disabled={disabled || locked || entered.length >= digitCount} />
          ))}
        </View>
        <View style={styles.keypadRow}>
          {[4, 5, 6].map((d) => (
            <KeyBtn key={d} label={String(d)} onPress={() => handleDigit(d)} disabled={disabled || locked || entered.length >= digitCount} />
          ))}
        </View>
        <View style={styles.keypadRow}>
          {[7, 8, 9].map((d) => (
            <KeyBtn key={d} label={String(d)} onPress={() => handleDigit(d)} disabled={disabled || locked || entered.length >= digitCount} />
          ))}
        </View>
        <View style={styles.keypadRow}>
          <KeyBtn label="⌫" onPress={handleDelete} variant="ghost" disabled={disabled || locked || entered.length === 0} />
          <KeyBtn label="0" onPress={() => handleDigit(0)} disabled={disabled || locked || entered.length >= digitCount} />
          <KeyBtn label="OK" onPress={handleOk} variant="primary" disabled={disabled || locked || entered.length !== digitCount} />
        </View>
      </View>
    </View>
  );
}

function KeyBtn({
  label,
  onPress,
  variant = 'default',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'ghost';
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        variant === 'primary' && styles.keyPrimary,
        variant === 'ghost' && styles.keyGhost,
        disabled && styles.keyDisabled,
        pressed && !disabled && styles.keyPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppText style={[styles.keyText, variant === 'primary' && !disabled ? { color: '#fff' } : null]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  problemBox: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carryCell: {
    width: CELL_WIDTH,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carryText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  digitText: {
    fontSize: DIGIT_FONT,
    lineHeight: CELL_HEIGHT,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  separator: {
    height: 3,
    backgroundColor: colors.text,
    marginVertical: 6,
  },
  resultCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    borderBottomWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCellActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  keypadWrap: {
    gap: spacing.xs,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  key: {
    flex: 1,
    minHeight: 52,
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
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  keyText: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
});
