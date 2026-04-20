import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function StatsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('parent.stats')}</AppText>
        <AppText variant="caption" color={colors.textMuted}>Phase 3 — US-058..060</AppText>
        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(parent)/dashboard')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
});
