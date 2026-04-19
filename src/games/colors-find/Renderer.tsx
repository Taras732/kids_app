import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors as theme, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type ColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type ColorAnswer = ColorId;

export interface ColorPayload {
  target: ColorId;
  candidates: ColorId[];
}

export const COLOR_HEX: Record<ColorId, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#FACC15',
  purple: '#A855F7',
  orange: '#F97316',
};

export function Renderer({ task, onAnswer, disabled }: RendererProps<ColorAnswer>) {
  const payload = task.payload as ColorPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: ColorId) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const targetName = t(`game.colors.names.${payload.target}`);
  const prompt = t('game.colors.prompt', { color: targetName });
  const isDisabled = disabled || locked;

  const row1 = payload.candidates.slice(0, 2);
  const row2 = payload.candidates.slice(2, 4);

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          {row1.map((id) => (
            <ColorSwatch
              key={id}
              id={id}
              onPress={() => handlePress(id)}
              disabled={isDisabled}
            />
          ))}
        </View>
        <View style={styles.row}>
          {row2.map((id) => (
            <ColorSwatch
              key={id}
              id={id}
              onPress={() => handlePress(id)}
              disabled={isDisabled}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface ColorSwatchProps {
  id: ColorId;
  onPress: () => void;
  disabled: boolean;
}

function ColorSwatch({ id, onPress, disabled }: ColorSwatchProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.swatchCell,
        pressed && !disabled && styles.swatchPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={id}
      hitSlop={4}
    >
      <View style={[styles.circle, { backgroundColor: COLOR_HEX[id] }]} />
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
  promptBox: {
    backgroundColor: theme.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  prompt: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.extraBold,
    color: theme.text,
    textAlign: 'center',
  },
  grid: {
    flex: 1,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  swatchCell: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchPressed: {
    transform: [{ scale: 0.97 }],
    borderColor: theme.primary,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
});
