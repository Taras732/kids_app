import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fontFamily, fontSizes, lineHeightMultiplier } from '../constants/theme';

type Variant = 'display' | 'h1' | 'h2' | 'title' | 'body' | 'caption';

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

const variantStyles: Record<Variant, TextStyle> = {
  display: { fontSize: fontSizes.display, fontFamily: fontFamily.extraBold },
  h1: { fontSize: fontSizes.xl, fontFamily: fontFamily.bold },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamily.bold },
  h2: { fontSize: fontSizes.lg, fontFamily: fontFamily.semiBold },
  body: { fontSize: fontSizes.md, fontFamily: fontFamily.regular },
  caption: { fontSize: fontSizes.sm, fontFamily: fontFamily.regular },
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const base = variantStyles[variant];
  const lineHeight = (base.fontSize ?? fontSizes.md) * lineHeightMultiplier;
  return (
    <Text
      style={[base, { lineHeight, color: color ?? colors.text }, style]}
      {...rest}
    />
  );
}
