import { Text, type TextProps, StyleSheet } from 'react-native';
import { colors, fontSizes } from '../constants/theme';

type Variant = 'display' | 'title' | 'body' | 'caption';

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

const variantStyles: Record<Variant, { fontSize: number; fontWeight: TextProps['style'] extends undefined ? never : '400' | '600' | '700' }> = {
  display: { fontSize: fontSizes.display, fontWeight: '700' },
  title: { fontSize: fontSizes.xl, fontWeight: '700' },
  body: { fontSize: fontSizes.md, fontWeight: '400' },
  caption: { fontSize: fontSizes.sm, fontWeight: '400' },
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[styles.base, variantStyles[variant], { color: color ?? colors.text }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});
