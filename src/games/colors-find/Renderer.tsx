import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors as theme, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type ColorId =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'brown'
  | 'black'
  | 'white'
  | 'gray'
  | 'cyan'
  | 'lime'
  | 'navy';

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
  pink: '#EC4899',
  brown: '#8B4513',
  black: '#111827',
  white: '#F9FAFB',
  gray: '#6B7280',
  cyan: '#06B6D4',
  lime: '#84CC16',
  navy: '#1E3A8A',
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

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
      </View>

      <View style={styles.grid}>
        {payload.candidates.map((id) => (
          <ColorSwatch
            key={id}
            id={id}
            onPress={() => handlePress(id)}
            disabled={isDisabled}
          />
        ))}
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
  const isWhite = id === 'white';
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
      <View
        style={[
          styles.circle,
          { backgroundColor: COLOR_HEX[id] },
          isWhite && styles.circleWhite,
        ]}
      />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingBottom: spacing.md,
    justifyContent: 'center',
  },
  swatchCell: {
    width: '47%',
    minHeight: 120,
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
  circleWhite: {
    borderWidth: 2,
    borderColor: theme.border,
  },
});
