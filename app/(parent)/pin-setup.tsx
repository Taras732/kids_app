import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { PinPad } from '@/src/components/PinPad';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';
import { usePinStore } from '@/src/stores/pinStore';

type Stage = 'enter' | 'confirm';

export default function PinSetupScreen() {
  const router = useRouter();
  const setPin = usePinStore((s) => s.setPin);
  const hasPin = usePinStore((s) => !!s.pinHash);

  const [stage, setStage] = useState<Stage>('enter');
  const [first, setFirst] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (next: string) => {
    setValue(next);
    setError(false);
    if (next.length !== 4) return;

    if (stage === 'enter') {
      setFirst(next);
      setStage('confirm');
      setTimeout(() => setValue(''), 150);
      return;
    }

    if (next === first) {
      setPin(next);
      router.replace('/(parent)/dashboard');
    } else {
      setError(true);
      setTimeout(() => {
        setValue('');
        setFirst('');
        setError(false);
        setStage('enter');
      }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          {hasPin ? t('parent.pinChangeTitle') : t('parent.pinSetupTitle')}
        </AppText>
        <AppText variant="h2" style={styles.subtitle}>
          {stage === 'enter' ? t('parent.pinEnterNew') : t('parent.pinConfirmNew')}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
          {error ? t('parent.pinMismatch') : t('parent.pinSetupHint')}
        </AppText>
        <PinPad value={value} error={error} onChange={handleChange} />
        <AppButton
          title={t('common.cancel')}
          tone="ghost"
          onPress={() => router.back()}
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
