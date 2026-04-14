import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radius, fontSizes } from '../constants/theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function FormInput({ label, error, style, ...rest }: FormInputProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      {label && <AppText variant="caption" color={colors.textMuted}>{label}</AppText>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error && <AppText variant="caption" color={colors.danger}>{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
});
