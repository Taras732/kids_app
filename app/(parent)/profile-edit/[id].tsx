import { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { ConfirmModal } from '@/src/components/ConfirmModal';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { AGE_GROUPS, type AgeGroupId } from '@/src/constants/ageGroups';
import { AVATARS } from '@/src/constants/avatars';
import { colors, spacing, radius, fontSizes, shadows } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ProfileEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);
  const { id } = useLocalSearchParams<{ id: string }>();

  const profile = useChildProfilesStore((s) => s.profiles.find((p) => p.id === id));
  const updateProfile = useChildProfilesStore((s) => s.updateProfile);
  const removeProfile = useChildProfilesStore((s) => s.removeProfile);

  const [name, setName] = useState(profile?.name ?? '');
  const [ageGroupId, setAgeGroupId] = useState<AgeGroupId | null>(profile?.ageGroupId ?? null);
  const [avatarId, setAvatarId] = useState<string | null>(profile?.avatarId ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <AppText variant="h2">Профіль не знайдено</AppText>
          <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(parent)/profiles')} />
        </View>
      </SafeAreaView>
    );
  }

  const canSave = name.trim().length >= 2 && !!ageGroupId && !!avatarId;

  const save = () => {
    if (!canSave || !ageGroupId || !avatarId) return;
    updateProfile(profile.id, { name: name.trim(), ageGroupId, avatarId });
    router.replace('/(parent)/profiles');
  };

  const doDelete = () => {
    removeProfile(profile.id);
    setConfirmDelete(false);
    router.replace('/(parent)/profiles');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ flex: 1, paddingTop: topPad }}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h1" style={styles.title}>
          {t('profiles.editTitle')}
        </AppText>

        <View style={styles.section}>
          <AppText variant="caption" color={colors.textMuted}>
            {t('profiles.namePlaceholder')}
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            maxLength={30}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="caption" color={colors.textMuted}>
            {t('onboarding.chooseAgeGroup')}
          </AppText>
          {AGE_GROUPS.map((g) => (
            <Pressable
              key={g.id}
              style={[styles.ageCard, ageGroupId === g.id && styles.ageCardSelected]}
              onPress={() => setAgeGroupId(g.id)}
            >
              <AppText variant="body" style={{ fontWeight: '700' }}>{g.name}</AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="caption" color={colors.textMuted}>
            {t('onboarding.chooseAvatar')}
          </AppText>
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <Pressable
                key={a}
                onPress={() => setAvatarId(a)}
                style={[styles.avatar, avatarId === a && styles.avatarSelected]}
              >
                <AppText style={{ fontSize: 40 }}>{a}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <AppButton title={t('profiles.save')} tone="primary" size="lg" disabled={!canSave} onPress={save} />
        <AppButton title={t('profiles.delete')} tone="danger" size="md" onPress={() => setConfirmDelete(true)} />
        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(parent)/profiles')} />
      </ScrollView>
      </View>

      <ConfirmModal
        visible={confirmDelete}
        title={t('profiles.deleteConfirmTitle', { name: profile.name })}
        message={t('profiles.deleteConfirmMsg')}
        confirmLabel={t('profiles.delete')}
        cancelLabel={t('common.cancel')}
        tone="danger"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
  title: { fontWeight: '800' },
  section: { gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSizes.lg,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
  },
  ageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  ageCardSelected: {
    borderColor: colors.primary,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: { borderColor: colors.primary },
});
