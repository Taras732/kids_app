import { Modal, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { colors, radius, spacing } from '../constants/theme';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <AppText variant="h2" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>
          {message ? (
            <ScrollView
              style={styles.messageScroll}
              contentContainerStyle={styles.messageContent}
              showsVerticalScrollIndicator={false}
            >
              <AppText variant="caption" color={colors.textMuted} style={styles.message}>
                {message}
              </AppText>
            </ScrollView>
          ) : null}
          <View style={styles.actions}>
            {cancelLabel ? (
              <View style={styles.actionBtn}>
                <AppButton
                  title={cancelLabel}
                  tone="ghost"
                  size="sm"
                  onPress={onCancel}
                  disabled={loading}
                  fullWidth
                />
              </View>
            ) : null}
            <View style={styles.actionBtn}>
              <AppButton
                title={confirmLabel}
                tone={tone === 'danger' ? 'danger' : 'primary'}
                size="sm"
                onPress={onConfirm}
                loading={loading}
                fullWidth
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 27, 58, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
  },
  messageScroll: {
    maxHeight: 220,
  },
  messageContent: {
    paddingVertical: spacing.xs,
  },
  message: {
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
