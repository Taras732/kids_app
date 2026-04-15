import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { GradientBackground } from '@/src/components/GradientBackground';
import { Checkbox, RequirementRow } from '@/src/components/Checkbox';
import { Alert } from '@/src/components/Alert';
import { signUp, type AuthErrorCode } from '@/src/hooks/useAuthActions';
import {
  isValidEmail,
  hasMinLength,
  hasLettersAndNumbers,
} from '@/src/utils/validation';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

const TERMS_URL = 'https://shkolyaryk.app/terms';
const PRIVACY_URL = 'https://shkolyaryk.app/privacy';
const COOLDOWN_SECONDS = 60;

interface AlertState {
  code: AuthErrorCode;
  message: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const emailError = email.length > 0 && !isValidEmail(email) ? t('auth.errorEmailInvalid') : null;
  const matchError = confirm.length > 0 && confirm !== password ? t('auth.errorPasswordsDoNotMatch') : null;

  const pwMinOk = hasMinLength(password);
  const pwLettersNumsOk = hasLettersAndNumbers(password);
  const pwValid = pwMinOk && pwLettersNumsOk;

  const canSubmit =
    isValidEmail(email) &&
    pwValid &&
    password === confirm &&
    consent &&
    !submitting &&
    cooldown === 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const mapErrorToMessage = (code: AuthErrorCode, fallback: string): string => {
    switch (code) {
      case 'user_exists': return t('auth.errorUserExists');
      case 'signup_disabled': return t('auth.errorSignupDisabled');
      case 'rate_limit': return t('auth.errorRateLimit');
      case 'network': return t('auth.errorNetwork');
      case 'password_weak': return t('auth.errorPasswordShort');
      case 'invalid_email': return t('auth.errorEmailInvalid');
      case 'not_configured': return fallback;
      default: return t('auth.errorUnknown');
    }
  };

  const handleSubmit = async () => {
    setAlert(null);
    setSubmitting(true);
    const normalizedEmail = email.trim().toLowerCase();
    const result = await signUp(normalizedEmail, password);
    setSubmitting(false);

    if (!result.ok) {
      const code = result.errorCode ?? 'unknown';
      setAlert({ code, message: mapErrorToMessage(code, result.error ?? '') });
      if (code === 'rate_limit') setCooldown(COOLDOWN_SECONDS);
      return;
    }

    router.replace({ pathname: '/(auth)/check-email', params: { email: normalizedEmail } });
  };

  const alertActions = alert?.code === 'user_exists'
    ? [
        { label: t('auth.alertLoginLink'), onPress: () => router.replace('/(auth)/login') },
        { label: t('auth.alertForgotLink'), onPress: () => router.replace('/(auth)/forgot-password') },
      ]
    : undefined;

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
            <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
              Безпечно для дітей. Без реклами.
            </AppText>

            {alert ? (
              <Alert
                variant="error"
                message={alert.message}
                actions={alertActions}
                onDismiss={() => setAlert(null)}
                autoDismissMs={alert.code === 'user_exists' ? null : 5000}
              />
            ) : null}

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

              <View style={{ gap: spacing.xs }}>
                <FormInput
                  label={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  placeholder={t('auth.reqMinChars')}
                  showPasswordToggle
                />
                {password.length > 0 ? (
                  <View style={styles.reqs}>
                    <RequirementRow met={pwMinOk} label={t('auth.reqMinChars')} />
                    <RequirementRow met={pwLettersNumsOk} label={t('auth.reqLettersNumbers')} />
                  </View>
                ) : null}
              </View>

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

              <View style={styles.consentRow}>
                <Checkbox checked={consent} onChange={setConsent} />
                <View style={styles.consentTextWrap}>
                  <AppText variant="caption" color={colors.textMuted}>
                    {t('auth.coppaConsent')}
                    <AppText
                      variant="caption"
                      color={colors.primary}
                      onPress={() => void Linking.openURL(TERMS_URL)}
                      style={styles.link}
                    >
                      {t('auth.termsLink')}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {t('auth.termsAnd')}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={colors.primary}
                      onPress={() => void Linking.openURL(PRIVACY_URL)}
                      style={styles.link}
                    >
                      {t('auth.privacyLink')}
                    </AppText>
                  </AppText>
                </View>
              </View>

              <AppButton
                title={
                  cooldown > 0
                    ? t('auth.cooldownRetry', { sec: cooldown })
                    : t('auth.signUp')
                }
                size="lg"
                fullWidth
                disabled={!canSubmit}
                loading={submitting}
                onPress={() => void handleSubmit()}
              />
            </View>

            <View style={styles.footer}>
              <AppText variant="caption" color={colors.textMuted}>
                {t('auth.haveAccount')}{' '}
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
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  reqs: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  consentTextWrap: {
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  linkStrong: {
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
