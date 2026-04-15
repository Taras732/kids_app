import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../constants/theme';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 80 }: LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius.full }]}>
      <AppText variant="h1" color="#FFFFFF" style={{ fontSize: size * 0.5 }}>
        Ш
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 24px rgba(108, 92, 231, 0.25)',
  },
});
