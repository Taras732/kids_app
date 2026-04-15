import { Animated, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { GradientBackground } from '@/src/components/GradientBackground';
import { colors, spacing, radius } from '@/src/constants/theme';

export default function CheckEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';

  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.center}>
            <Animated.View
              style={[styles.emailIcon, { transform: [{ scale }], opacity }]}
            >
              <AppText style={styles.emoji}>✉️</AppText>
            </Animated.View>
            <AppText variant="h1" style={styles.title}>
              Перевір пошту
            </AppText>
            <AppText variant="body" color={colors.textMuted} style={styles.body}>
              Ми надіслали лист{email ? ' на ' : ''}
              {email ? (
                <AppText variant="body" color={colors.text} style={styles.emailStrong}>
                  {email}
                </AppText>
              ) : null}
              . Натисни на посилання у листі для підтвердження.
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
              Не отримав?{' '}
              <AppText variant="caption" color={colors.primary} style={styles.linkStrong}>
                Надіслати знову
              </AppText>
            </AppText>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Я підтвердив(ла)"
              size="lg"
              fullWidth
              onPress={() => router.replace('/(main)')}
            />
            <AppButton
              title="Назад"
              size="lg"
              tone="ghost"
              fullWidth
              onPress={() => router.replace('/(auth)/register')}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIcon: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  body: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    maxWidth: 320,
    marginBottom: spacing.md,
  },
  emailStrong: {
    fontWeight: '700',
  },
  hint: {
    textAlign: 'center',
  },
  linkStrong: {
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
  },
});
