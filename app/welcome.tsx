import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { GradientBackground } from '@/src/components/GradientBackground';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { colors, spacing } from '@/src/constants/theme';

const slides = [
  {
    emoji: '🎮',
    title: 'Граємось і навчаємось',
    text: '8 островів з міні-іграми для математики, букв, логіки і не тільки',
  },
  {
    emoji: '🦊',
    title: 'Маскот для кожного віку',
    text: 'Коко, Бамбі, Ліса і Софі — твої помічники у пригодах',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Безпечно для дітей',
    text: 'Жодної реклами. Батьки бачать прогрес і керують часом гри',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const markWelcomeSeen = useOnboardingStore((s) => s.markWelcomeSeen);
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [rotate]);

  const handleNext = () => {
    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      if (step + 1 >= slides.length) {
        markWelcomeSeen();
        router.replace('/(auth)/register');
        return;
      }
      setStep(step + 1);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const handleSkip = () => {
    markWelcomeSeen();
    router.replace('/(auth)/login');
  };

  const slide = slides[step];
  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '8deg'] });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.skipRow}>
          <Pressable onPress={handleSkip} hitSlop={10}>
            <AppText variant="caption" color={colors.textMuted} style={styles.skip}>
              Пропустити
            </AppText>
          </Pressable>
        </View>

        <Animated.View style={[styles.hero, { opacity: fade }]}>
          <Animated.View style={[styles.blob, { transform: [{ rotate: rotation }] }]}>
            <LinearGradient
              colors={['#6C5CE7', '#FF6EC7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.blobGrad}
            >
              <AppText style={styles.emoji}>{slide.emoji}</AppText>
            </LinearGradient>
          </Animated.View>
          <AppText style={styles.title}>{slide.title}</AppText>
          <AppText style={styles.text}>{slide.text}</AppText>
        </Animated.View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          <AppButton
            title={step + 1 === slides.length ? 'Почати' : 'Далі'}
            size="lg"
            fullWidth
            onPress={handleNext}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  skipRow: { alignItems: 'flex-end' },
  skip: { fontWeight: '700' },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  blob: {
    width: 240,
    height: 240,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 20,
  },
  blobGrad: {
    flex: 1,
    borderRadius: 120,
    borderTopLeftRadius: 130,
    borderBottomRightRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 140 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    color: colors.text,
    lineHeight: 34,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    maxWidth: 320,
  },
  bottom: { gap: spacing.md, paddingBottom: spacing.sm },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
});
