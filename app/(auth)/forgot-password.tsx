import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { GradientBackground } from '@/src/components/GradientBackground';
import { requestPasswordReset } from '@/src/hooks/useAuthActions';
import { isValidEmail } from '@/src/utils/validation';
import { colors, spacing, radius } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ForgotPasswordScreen() {
  const router = useRouter();
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
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.iconWrap}>
              <View style={styles.iconBadge}>
                <AppText style={styles.iconEmoji}>🔑</AppText>
              </View>
            </View>

            <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
              {sent ? t('auth.resetSentHint') : t('auth.resetHint')}
            </AppText>

            {sent ? (
              <View style={styles.sentBox}>
                <AppText variant="body" color={colors.success} style={styles.sentMsg}>
                  {t('auth.resetLinkSent', { email })}
                </AppText>
              </View>
            ) : (
              <View style={styles.form}>
                <FormInput
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  placeholder="parent@email.com"
                  error={emailError}
                />

                {error ? (
                  <AppText variant="caption" color={colors.danger}>
                    {error}
                  </AppText>
                ) : null}

                <AppButton
                  title={t('auth.sendResetLink')}
                  size="lg"
                  fullWidth
                  disabled={!canSubmit}
                  loading={submitting}
                  onPress={() => void handleSubmit()}
                />
              </View>
            )}

            <View style={styles.footer}>
              <AppText variant="caption" color={colors.textMuted}>
                {t('auth.remembered')}{' '}
              </AppText>
              <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                <AppText variant="caption" color={colors.primary} style={styles.linkStrong}>
                  {t('auth.signIn')}
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
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
  sentBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  sentMsg: {
    textAlign: 'center',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  linkStrong: {
    fontWeight: '700',
  },
});
