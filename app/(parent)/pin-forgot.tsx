import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { Alert } from '@/src/components/Alert';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';
import { signIn, requestPasswordReset } from '@/src/hooks/useAuthActions';
import { useAuthStore } from '@/src/stores/authStore';
import { usePinStore } from '@/src/stores/pinStore';

export default function PinForgotScreen() {
  const router = useRouter();
  const email = useAuthStore((s) => s.email);
  const clearPin = usePinStore((s) => s.clearPin);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const confirmPassword = async () => {
    if (!email || !password) return;
    setBusy(true);
    setErr(null);
    const res = await signIn(email, password);
    setBusy(false);
    if (!res.ok) {
      setErr(t('auth.errorInvalidCreds'));
      return;
    }
    clearPin();
    router.replace('/(parent)/pin-setup' as never);
  };

  const sendResetEmail = async () => {
    if (!email) return;
    setBusy(true);
    setErr(null);
    const res = await requestPasswordReset(email);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error ?? t('auth.errorUnknown'));
      return;
    }
    setInfo(t('auth.resetLinkSent', { email }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('parent.pinForgotTitle')}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('parent.pinForgotHint', { email: email ?? '' })}
        </AppText>

        {err ? <Alert variant="error" message={err} /> : null}
        {info ? <Alert variant="success" message={info} autoDismissMs={null} /> : null}

        <FormInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={t('auth.passwordPlaceholder')}
          autoCapitalize="none"
        />

        <AppButton
          title={t('parent.pinForgotConfirm')}
          size="lg"
          onPress={() => void confirmPassword()}
          loading={busy}
          disabled={!password || busy}
        />

        <AppButton
          title={t('parent.pinForgotResetEmail')}
          tone="ghost"
          onPress={() => void sendResetEmail()}
          disabled={busy}
        />

        <AppButton
          title={t('common.back')}
          tone="ghost"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: 'center' },
});
