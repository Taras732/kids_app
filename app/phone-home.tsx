import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/AppText';
import { colors, radius, spacing } from '@/src/constants/theme';

interface AppIcon {
  id: string;
  name: string;
  emoji: string;
  bg: string;
}

const APPS: AppIcon[] = [
  { id: 'phone', name: 'Телефон', emoji: '📞', bg: '#22C55E' },
  { id: 'messages', name: 'Повідом.', emoji: '💬', bg: '#3B82F6' },
  { id: 'mail', name: 'Пошта', emoji: '✉️', bg: '#60A5FA' },
  { id: 'camera', name: 'Камера', emoji: '📷', bg: '#1F2937' },
  { id: 'photos', name: 'Фото', emoji: '🖼️', bg: '#F472B6' },
  { id: 'maps', name: 'Карти', emoji: '🗺️', bg: '#34D399' },
  { id: 'music', name: 'Музика', emoji: '🎵', bg: '#EF4444' },
  { id: 'notes', name: 'Нотатки', emoji: '📝', bg: '#FBBF24' },
  { id: 'calendar', name: 'Календар', emoji: '📅', bg: '#FFFFFF' },
  { id: 'weather', name: 'Погода', emoji: '🌤️', bg: '#0EA5E9' },
  { id: 'settings', name: 'Налашт.', emoji: '⚙️', bg: '#6B7280' },
  { id: 'clock', name: 'Годинник', emoji: '⏰', bg: '#0F172A' },
];

const DOCK: AppIcon[] = [
  { id: 'dock-phone', name: 'Телефон', emoji: '📞', bg: '#22C55E' },
  { id: 'dock-safari', name: 'Safari', emoji: '🧭', bg: '#FFFFFF' },
  { id: 'dock-messages', name: 'Чати', emoji: '💬', bg: '#3B82F6' },
  { id: 'dock-music', name: 'Музика', emoji: '🎵', bg: '#EF4444' },
];

export default function PhoneHomeScreen() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/(auth)/login');
    }
  }, [router]);

  if (Platform.OS !== 'web') return null;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const weekday = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'][now.getDay()];
  const day = now.getDate();
  const month = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'][now.getMonth()];

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <AppText style={styles.statusText}>{`${hh}:${mm}`}</AppText>
        <AppText style={styles.statusText}>🔋</AppText>
      </View>

      <View style={styles.clockWrap}>
        <AppText style={styles.clockDate}>{`${weekday}, ${day} ${month}`}</AppText>
        <AppText style={styles.clockTime}>{`${hh}:${mm}`}</AppText>
      </View>

      <View style={styles.grid}>
        {APPS.map((app) => (
          <AppTile key={app.id} app={app} />
        ))}
      </View>

      <View style={styles.dockWrap}>
        <View style={styles.dock}>
          {DOCK.map((app) => (
            <AppTile key={app.id} app={app} hideLabel />
          ))}
        </View>
      </View>
    </View>
  );
}

function AppTile({ app, hideLabel = false }: { app: AppIcon; hideLabel?: boolean }) {
  return (
    <Pressable style={styles.tile} onPress={() => {}}>
      <View style={[styles.iconBg, { backgroundColor: app.bg }]}>
        <AppText style={styles.iconEmoji}>{app.emoji}</AppText>
      </View>
      {!hideLabel ? (
        <AppText style={styles.iconLabel}>{app.name}</AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingTop: 54,
    paddingHorizontal: spacing.md,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusText: { color: '#fff', fontWeight: '700' as const, fontSize: 14 },
  clockWrap: { alignItems: 'center', marginBottom: spacing.xl },
  clockDate: { color: '#fff', fontSize: 14, fontWeight: '600' as const, opacity: 0.8 },
  clockTime: { color: '#fff', fontSize: 56, fontWeight: '200' as const, letterSpacing: -2 },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  tile: {
    width: '22%',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  iconBg: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 30 },
  iconLabel: { color: '#fff', fontSize: 11, fontWeight: '600' as const, textAlign: 'center' },
  dockWrap: { paddingBottom: spacing.xl, paddingTop: spacing.sm },
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
