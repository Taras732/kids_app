import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform, type TextInputProps } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radius, fontSizes, fontFamily } from '../constants/theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leadingIcon?: string;
  showPasswordToggle?: boolean;
}

export function FormInput({
  label,
  error,
  leadingIcon,
  showPasswordToggle = false,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  ...rest
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.border;

  const effectiveSecure = secureTextEntry && !passwordVisible;

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <AppText style={styles.label} color={colors.textMuted}>{label}</AppText> : null}
      <View style={[styles.wrapper, { borderColor }]}>
        {leadingIcon ? <AppText style={styles.icon}>{leadingIcon}</AppText> : null}
        <TextInput
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={effectiveSecure}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {showPasswordToggle ? (
          <Pressable onPress={() => setPasswordVisible((v) => !v)} hitSlop={8}>
            <AppText style={styles.icon}>{passwordVisible ? '🙈' : '👁'}</AppText>
          </Pressable>
        ) : null}
      </View>
      {error && <AppText variant="caption" color={colors.error}>{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.smd,
    gap: spacing.sm,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fontFamily.regular,
    color: colors.text,
    paddingVertical: spacing.sm,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  icon: {
    fontSize: fontSizes.lg,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    paddingLeft: spacing.xs,
    marginBottom: 2,
  },
});
