import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { ConfirmModal } from '@/src/components/ConfirmModal';
import { GameHeader } from '@/src/components/game/GameHeader';
import { FeedbackOverlay } from '@/src/components/game/FeedbackOverlay';
import { getGame } from '@/src/games/registry';
import { useGameSession } from '@/src/games/useGameSession';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { useProgressStore } from '@/src/stores/progressStore';
import { evaluateBadges } from '@/src/utils/badgeEngine';
import { colors, radius, spacing, shadows } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);

  const activeProfile = useChildProfilesStore((s) => s.getActiveProfile());
  const addXp = useProgressStore((s) => s.addXp);
  const recordGameSession = useProgressStore((s) => s.recordGameSession);
  const awardBadge = useProgressStore((s) => s.awardBadge);

  const gameId = id ?? '';
  const game = gameId ? getGame(gameId) : undefined;

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.centered, { paddingTop: topPad }]}>
          <AppText variant="h2">Гру не знайдено</AppText>
          <AppText variant="caption" color={colors.textMuted}>{gameId}</AppText>
          <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(main)')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GameScreenInner
      gameId={gameId}
      profileId={activeProfile?.id ?? null}
      addXp={addXp}
      recordGameSession={recordGameSession}
      awardBadge={awardBadge}
      topPad={topPad}
      onExit={() => router.replace('/(main)')}
      onFinished={(stars, xp) => {
        router.replace({
          pathname: '/(main)/game-result',
          params: { gameId, stars: String(stars), xp: String(xp) },
        });
      }}
    />
  );
}

interface InnerProps {
  gameId: string;
  profileId: string | null;
  addXp: (profileId: string, amount: number) => void;
  recordGameSession: (profileId: string, gameId: string, score: number, difficulty: number) => void;
  awardBadge: (profileId: string, badgeId: string) => void;
  topPad: number;
  onExit: () => void;
  onFinished: (stars: 1 | 2 | 3, xp: number) => void;
}

function GameScreenInner({ gameId, profileId, addXp, recordGameSession, awardBadge, topPad, onExit, onFinished }: InnerProps) {
  const session = useGameSession(gameId);
  const game = getGame(gameId)!;
  const Renderer = game.Renderer;

  const [confirmExit, setConfirmExit] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const committedRef = useRef(false);

  useEffect(() => {
    if (session.phase === 'finished' && !committedRef.current) {
      committedRef.current = true;
      if (profileId) {
        const stars = session.stars as 1 | 2 | 3;
        recordGameSession(profileId, gameId, stars, 1.0);
        addXp(profileId, session.xpEarned);
        const state = useProgressStore.getState();
        const newly = evaluateBadges(state, profileId);
        for (const id of newly) awardBadge(profileId, id);
      }
      onFinished(session.stars as 1 | 2 | 3, session.xpEarned);
    }
  }, [session.phase, session.stars, session.xpEarned, profileId, gameId, addXp, recordGameSession, awardBadge, onFinished]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (session.phase === 'playing' || session.phase === 'intro') {
        setConfirmExit(true);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [session.phase]);

  const handleBack = useCallback(() => {
    if (session.phase === 'intro') {
      onExit();
      return;
    }
    setConfirmExit(true);
  }, [session.phase, onExit]);

  if (session.phase === 'intro') {
    const gameName = game.name.startsWith('game.') ? t(game.name) : game.name;
    const taglineMatch = game.name.match(/^game\.([^.]+)\.name$/);
    const taglineKey = taglineMatch ? `game.taglines.${taglineMatch[1]}` : null;
    const taglineRaw = taglineKey ? t(taglineKey) : null;
    const tagline = taglineRaw && taglineRaw !== taglineKey ? taglineRaw : null;

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.intro, { paddingTop: topPad }]}>
          <AppText variant="display" style={styles.mascot}>{game.icon ?? '🎯'}</AppText>
          <AppText variant="h1" style={styles.introTitle}>
            {gameName}
          </AppText>
          {tagline ? (
            <AppText variant="body" color={colors.textMuted} style={styles.introTagline}>
              {tagline}
            </AppText>
          ) : null}
          <AppText variant="body" color={colors.textMuted} style={styles.introHint}>
            {t('game.intro')}
          </AppText>
          <AppButton title={t('game.letsgo')} tone="primary" size="xl" onPress={session.start} />
          {game.rulesKey ? (
            <AppButton title={t('game.rules')} tone="outline" size="md" onPress={() => setRulesOpen(true)} />
          ) : null}
          <AppButton title={t('common.back')} tone="ghost" onPress={onExit} />
        </View>

        <ConfirmModal
          visible={rulesOpen}
          title={t('game.rulesTitle')}
          message={game.rulesKey ? t(game.rulesKey) : ''}
          confirmLabel={t('game.rulesOk')}
          tone="primary"
          onConfirm={() => setRulesOpen(false)}
          onCancel={() => setRulesOpen(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.playWrap, { paddingTop: topPad }]}>
        <GameHeader
          taskIndex={session.taskIndex}
          totalTasks={session.totalTasks}
          onBack={handleBack}
        />

        <View style={styles.playfield}>
          {session.currentTask ? (
            <Renderer
              task={session.currentTask}
              onAnswer={session.submit}
              disabled={session.phase !== 'playing'}
            />
          ) : null}
        </View>

        <FeedbackOverlay
          visible={session.phase === 'feedback-correct' || session.phase === 'feedback-wrong'}
          kind={session.phase === 'feedback-correct' ? 'correct' : 'wrong'}
          messageCorrect={t('game.correct')}
          messageWrong={t('game.tryAgain')}
        />
      </View>

      <ConfirmModal
        visible={confirmExit}
        title={t('game.exitConfirm')}
        message={t('game.exitConfirmMsg')}
        confirmLabel={t('common.continue')}
        cancelLabel={t('common.cancel')}
        tone="danger"
        onConfirm={() => {
          setConfirmExit(false);
          onExit();
        }}
        onCancel={() => setConfirmExit(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  intro: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mascot: { fontSize: 96 },
  introTitle: { textAlign: 'center' },
  introTagline: { textAlign: 'center', fontSize: 18, paddingHorizontal: spacing.md },
  introHint: { textAlign: 'center' },
  playWrap: {
    flex: 1,
  },
  playfield: {
    flex: 1,
    ...shadows.card,
    borderRadius: radius.xl,
  },
});
