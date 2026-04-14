import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { getIslandById } from '@/src/constants/islands';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function IslandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const island = getIslandById(id ?? '');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="display">{island?.icon ?? '❓'}</AppText>
        <AppText variant="title">{island?.name ?? 'Острів'}</AppText>
        <AppText variant="body" color={colors.textMuted}>{island?.description ?? ''}</AppText>
        <AppText variant="caption" color={colors.textMuted}>Ігри скоро з'являться 🎮</AppText>
        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
});
