import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { signUp } from '@/src/hooks/useAuthActions';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = email.length > 0 && !isValidEmail(email) ? t('auth.errorEmailInvalid') : null;
  const passwordError = password.length > 0 && !isValidPassword(password) ? t('auth.errorPasswordShort') : null;
  const matchError = confirm.length > 0 && confirm !== password ? t('auth.errorPasswordsDoNotMatch') : null;
  const canSubmit = isValidEmail(email) && isValidPassword(password) && password === confirm && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await signUp(email.trim(), password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'Error');
      return;
    }
    if (result.needsEmailConfirmation) {
      router.replace('/(auth)/email-confirmation');
    } else {
      router.replace('/(main)/onboarding/language');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <AppText variant="title">{t('auth.register')}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{t('auth.parentAccount')}</AppText>
          </View>

          <View style={styles.form}>
            <FormInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="parent@example.com"
              error={emailError}
            />
            <FormInput
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              error={passwordError}
            />
            <FormInput
              label={t('auth.confirmPassword')}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              error={matchError}
            />
            {error && <AppText variant="caption" color={colors.danger}>{error}</AppText>}
            <AppButton title={t('auth.signUp')} size="lg" disabled={!canSubmit} onPress={() => void handleSubmit()} />
          </View>

          <View style={styles.footer}>
            <AppText variant="caption" color={colors.textMuted}>{t('auth.haveAccount')}</AppText>
            <Link href="/(auth)/login" asChild>
              <AppButton title={t('auth.signIn')} size="md" tone="ghost" />
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  header: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl },
  form: { gap: spacing.md },
  footer: { alignItems: 'center', gap: spacing.sm, marginTop: 'auto' },
});
