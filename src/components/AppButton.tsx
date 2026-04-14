import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { AppText } from './AppText';

type Size = 'sm' | 'md' | 'lg';
type Tone = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  size?: Size;
  tone?: Tone;
  style?: ViewStyle;
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 52 },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 64 },
};

const toneBg: Record<Tone, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  ghost: 'transparent',
};

export function AppButton({ title, size = 'md', tone = 'primary', style, disabled, ...rest }: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        { backgroundColor: toneBg[tone], opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        tone === 'ghost' && { borderWidth: 2, borderColor: colors.primary },
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <AppText variant="body" color={tone === 'ghost' ? colors.primary : '#fff'} style={{ fontWeight: '700' }}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
