import { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../constants/theme';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface AlertAction {
  label: string;
  onPress: () => void;
}

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  actions?: AlertAction[];
  onDismiss?: () => void;
  autoDismissMs?: number | null;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  error: { bg: 'rgba(239,68,68,0.1)', border: colors.error, text: colors.error, icon: '⚠️' },
  warning: { bg: 'rgba(255,159,67,0.12)', border: colors.warning, text: colors.warning, icon: '⚠️' },
  info: { bg: 'rgba(108,92,231,0.1)', border: colors.primary, text: colors.primary, icon: 'ℹ️' },
  success: { bg: 'rgba(34,197,94,0.1)', border: colors.success, text: colors.success, icon: '✓' },
};

export function Alert({ variant = 'error', message, actions, onDismiss, autoDismissMs = 5000 }: AlertProps) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!autoDismissMs || !dismissRef.current) return;
    const id = setTimeout(() => dismissRef.current?.(), autoDismissMs);
    return () => clearTimeout(id);
  }, [autoDismissMs, message]);

  const v = variantStyles[variant];

  return (
    <View style={[styles.wrap, { backgroundColor: v.bg, borderLeftColor: v.border }]}>
      <View style={styles.row}>
        <AppText style={styles.icon}>{v.icon}</AppText>
        <View style={styles.body}>
          <AppText variant="caption" color={colors.text} style={styles.message}>
            {message}
          </AppText>
          {actions && actions.length > 0 ? (
            <View style={styles.actions}>
              {actions.map((a, idx) => (
                <Pressable key={idx} onPress={a.onPress} hitSlop={8}>
                  <AppText variant="caption" color={v.text} style={styles.actionLabel}>
                    {a.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        {onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={12} accessibilityLabel="Закрити">
            <AppText color={colors.textMuted} style={styles.close}>
              ✕
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: spacing.smd,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 18,
    marginTop: 1,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  message: {
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionLabel: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  close: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
  },
});
