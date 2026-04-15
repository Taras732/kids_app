import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { PinPad } from '@/src/components/PinPad';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';
import { usePinStore } from '@/src/stores/pinStore';

export default function PinGateScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [lockMsg, setLockMsg] = useState<string | null>(null);

  const verifyPin = usePinStore((s) => s.verifyPin);
  const registerFailure = usePinStore((s) => s.registerFailure);
  const resetFailures = usePinStore((s) => s.resetFailures);
  const isLocked = usePinStore((s) => s.isLocked);
  const failedAttempts = usePinStore((s) => s.failedAttempts);
  const lockedUntil = usePinStore((s) => s.lockedUntil);
  const setUnlocked = usePinStore((s) => s.setUnlocked);

  useEffect(() => {
    if (!lockedUntil) {
      setLockMsg(null);
      return;
    }
    const update = () => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        resetFailures();
        setLockMsg(null);
      } else {
        setLockMsg(t('parent.pinLocked', { sec: left }));
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, resetFailures]);

  useEffect(() => {
    if (value.length !== 4) return;
    if (isLocked()) return;
    if (verifyPin(value)) {
      resetFailures();
      setUnlocked(true);
      router.replace((returnTo ?? '/(parent)/dashboard') as never);
      return;
    }
    registerFailure();
    setError(true);
    setTimeout(() => {
      setError(false);
      setValue('');
    }, 500);
  }, [value, verifyPin, registerFailure, resetFailures, isLocked, router, returnTo]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          {t('parent.dashboard')}
        </AppText>
        <AppText variant="h2" style={styles.subtitle}>
          {t('parent.pinEnter')}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
          {lockMsg ?? (failedAttempts > 0 ? t('parent.pinAttemptsLeft', { n: 5 - failedAttempts }) : t('parent.pinHint'))}
        </AppText>
        <PinPad value={value} error={error} onChange={setValue} />
        <AppButton
          title={t('parent.pinForgot')}
          tone="ghost"
          onPress={() => router.push('/(parent)/pin-forgot' as never)}
        />
        <AppButton
          title={t('common.cancel')}
          tone="ghost"
          onPress={() => router.replace('/(main)')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center', gap: spacing.md, justifyContent: 'center' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: spacing.md },
  hint: { textAlign: 'center', marginBottom: spacing.md, minHeight: 20 },
});
