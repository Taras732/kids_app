import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { GradientBackground } from '@/src/components/GradientBackground';
import { GoogleSignInButton } from '@/src/components/GoogleSignInButton';
import { signIn, signInWithGoogle } from '@/src/hooks/useAuthActions';
import { isValidEmail } from '@/src/utils/validation';
import { isSupabaseConfigured } from '@/src/utils/supabase';
import { colors, spacing, radius } from '@/src/constants/theme';
import { t } from '@/src/i18n';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = email.length > 0 && !isValidEmail(email) ? t('auth.errorEmailInvalid') : null;
  const canSubmit = isValidEmail(email) && password.length > 0 && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? 'Error');
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) setError(result.error ?? 'Google sign-in failed');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.logoBlock}>
              <AppText variant="h1" style={styles.title}>
                {t('auth.welcomeBack')}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
                {t('auth.loginHint')}
              </AppText>
            </View>

            {!isSupabaseConfigured() ? (
              <View style={styles.warn}>
                <AppText variant="caption" color={colors.danger}>
                  Supabase не налаштовано — див. SUPABASE_SETUP.md
                </AppText>
              </View>
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
                  autoComplete="current-password"
                  textContentType="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  showPasswordToggle
                />
                <View style={styles.forgotRow}>
                  <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
                    <AppText variant="caption" color={colors.primary} style={styles.linkStrong}>
                      {t('auth.forgotPassword')}
                    </AppText>
                  </Pressable>
                </View>
              </View>

              {error ? (
                <AppText variant="caption" color={colors.danger}>
                  {error}
                </AppText>
              ) : null}

              <AppButton
                title={t('auth.signIn')}
                size="lg"
                fullWidth
                disabled={!canSubmit}
                loading={submitting}
                onPress={() => void handleSubmit()}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText variant="caption" color={colors.textMuted}>
                {t('auth.orContinueWith')}
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton
              onPress={() => void handleGoogle()}
              loading={googleLoading}
            />

            <View style={styles.footer}>
              <AppText variant="caption" color={colors.textMuted}>
                {t('auth.noAccount')}{' '}
              </AppText>
              <Pressable onPress={() => router.replace('/(auth)/register')} hitSlop={8}>
                <AppText variant="caption" color={colors.primary} style={styles.linkStrong}>
                  {t('auth.signUp')}
                </AppText>
              </Pressable>
            </View>

            {__DEV__ ? (
              <Pressable
                onPress={() => {
                  useOnboardingStore.getState().resetOnboarding();
                  router.replace('/splash');
                }}
                hitSlop={8}
                style={styles.devReset}
              >
                <AppText variant="caption" color={colors.textMuted}>
                  ↺ Скинути онбординг (dev)
                </AppText>
              </Pressable>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  logoBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  warn: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
  },
  form: {
    gap: spacing.md,
  },
  forgotRow: {
    alignItems: 'flex-end',
  },
  linkStrong: {
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  devReset: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    opacity: 0.5,
  },
});
