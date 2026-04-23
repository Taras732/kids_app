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

interface AppleGridProps {
  count: number;
  size: number;
  columns: number;
}

function AppleGrid({ count, size, columns }: AppleGridProps) {
  const maxWidth = columns * (size + 4);
  return (
    <View style={[gridStyles.wrap, { maxWidth }]}>
      {Array.from({ length: count }).map((_, i) => (
        <AppText
          key={i}
          style={{ fontSize: size, lineHeight: size + 4, width: size, textAlign: 'center' }}
        >
          {APPLE}
        </AppText>
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export function Renderer({ task, onAnswer, disabled }: RendererProps<RecognizeDigitAnswer>) {
  const p = task.payload as RecognizeDigitPayload;

  return (
    <View style={styles.container}>
      <View style={styles.promptBox}>
        {p.mode === 'digit-to-qty' ? (
          <AppText style={styles.bigDigit}>{p.correctNumber}</AppText>
        ) : (
          <AppGridPrompt count={p.correctNumber} />
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
              <AppleGrid count={n} size={18} columns={5} />
            ) : (
              <AppText style={styles.optionDigit}>{n}</AppText>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AppGridPrompt({ count }: { count: number }) {
  const size = count <= 4 ? 56 : count <= 6 ? 48 : count <= 9 ? 44 : 40;
  const columns = count <= 4 ? count : count <= 6 ? 3 : count <= 9 ? 3 : 5;
  return <AppleGrid count={count} size={size} columns={columns} />;
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
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    minHeight: 130,
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
});
