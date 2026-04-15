import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { GradientBackground } from '@/src/components/GradientBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { updatePassword } from '@/src/hooks/useAuthActions';
import { isValidPassword } from '@/src/utils/validation';
import { colors, spacing, radius } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordError =
    password.length > 0 && !isValidPassword(password) ? t('auth.errorPasswordShort') : null;
  const matchError =
    confirm.length > 0 && confirm !== password ? t('auth.errorPasswordsDoNotMatch') : null;
  const canSubmit = isValidPassword(password) && password === confirm && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);
    if (result.ok) {
      Alert.alert('✅', 'Пароль оновлено');
      router.replace('/(main)');
    } else {
      Alert.alert('⚠️', result.error ?? 'Error');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.headerWrap}>
            <ScreenHeader
              title={t('auth.newPassword')}
              onBack={() => router.replace('/(auth)/login')}
            />
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.iconWrap}>
              <View style={styles.iconBadge}>
                <AppText style={styles.iconEmoji}>🔐</AppText>
              </View>
            </View>

            <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
              Придумай новий пароль для свого акаунту
            </AppText>

            <View style={styles.form}>
              <FormInput
                label={t('auth.newPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="мін. 8 символів"
                showPasswordToggle
                error={passwordError}
              />

              <FormInput
                label={t('auth.confirmPassword')}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                autoCapitalize="none"
                placeholder={t('auth.confirmPassword')}
                showPasswordToggle
                error={matchError}
              />

              <AppButton
                title={t('common.save')}
                size="lg"
                fullWidth
                disabled={!canSubmit}
                loading={submitting}
                onPress={() => void handleSubmit()}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scrollView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
});
