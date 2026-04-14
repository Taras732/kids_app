import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { requestPasswordReset } from '@/src/hooks/useAuthActions';
import { isValidEmail } from '@/src/utils/validation';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = email.length > 0 && !isValidEmail(email) ? t('auth.errorEmailInvalid') : null;
  const canSubmit = isValidEmail(email) && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (result.ok) setSent(true);
    else setError(result.error ?? 'Error');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <AppText variant="title">{t('auth.forgotPassword')}</AppText>

          {sent ? (
            <>
              <AppText variant="display">📬</AppText>
              <AppText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
                {t('auth.resetLinkSent', { email })}
              </AppText>
            </>
          ) : (
            <View style={styles.form}>
              <FormInput
                label={t('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="parent@example.com"
                error={emailError}
              />
              {error && <AppText variant="caption" color={colors.danger}>{error}</AppText>}
              <AppButton title={t('auth.sendResetLink')} size="lg" disabled={!canSubmit} onPress={() => void handleSubmit()} />
            </View>
          )}

          <Link href="/(auth)/login" asChild>
            <AppButton title={t('common.back')} tone="ghost" />
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  form: { width: '100%', gap: spacing.md },
});
