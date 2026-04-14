import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { signIn } from '@/src/hooks/useAuthActions';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';
import { isSupabaseConfigured } from '@/src/utils/supabase';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = email.length > 0 && !isValidEmail(email) ? t('auth.errorEmailInvalid') : null;
  const canSubmit = isValidEmail(email) && isValidPassword(password) && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? 'Error');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <AppText variant="display">📚</AppText>
            <AppText variant="title">{t('app.name')}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{t('auth.parentAccount')}</AppText>
          </View>

          {!isSupabaseConfigured() && (
            <View style={styles.warn}>
              <AppText variant="caption" color={colors.danger}>
                Supabase не налаштовано — див. SUPABASE_SETUP.md
              </AppText>
            </View>
          )}

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
              autoComplete="current-password"
              textContentType="password"
            />
            {error && <AppText variant="caption" color={colors.danger}>{error}</AppText>}
            <AppButton title={t('auth.signIn')} size="lg" disabled={!canSubmit} onPress={() => void handleSubmit()} />
            <Link href="/(auth)/forgot-password" asChild>
              <AppButton title={t('auth.forgotPassword')} size="sm" tone="ghost" />
            </Link>
          </View>

          <View style={styles.footer}>
            <AppText variant="caption" color={colors.textMuted}>{t('auth.noAccount')}</AppText>
            <Link href="/(auth)/register" asChild>
              <AppButton title={t('auth.signUp')} size="md" tone="ghost" />
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
  warn: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
  },
});
