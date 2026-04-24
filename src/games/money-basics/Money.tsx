import { View, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { fontFamily, shadows } from '../../constants/theme';

export interface MoneyUnit {
  /** value in kopecks (1 грн = 100 коп) */
  valueKop: number;
}

interface MoneyViewProps {
  valueKop: number;
  size?: 'sm' | 'md' | 'lg';
}

const DENOMINATION_COLORS: Record<number, { bg: string; text: string }> = {
  // coins (kopecks)
  10: { bg: '#B8A48A', text: '#3A2F1E' },
  50: { bg: '#D9C79B', text: '#3A2F1E' },
  // coins (гривні)
  100: { bg: '#E8D17E', text: '#3A2F1E' },
  200: { bg: '#B79A4C', text: '#2B1E08' },
  500: { bg: '#6EA4BF', text: '#0F2A36' },
  1000: { bg: '#C06E6E', text: '#2F0F0F' },
  // bills (гривні)
  2000: { bg: '#8FBF7A', text: '#152A0F' },
  5000: { bg: '#A98363', text: '#2A170C' },
  10000: { bg: '#9F7FBF', text: '#1F0F2A' },
  20000: { bg: '#E59B5C', text: '#2F1608' },
  50000: { bg: '#9A9A9A', text: '#1A1A1A' },
  100000: { bg: '#C8C8C8', text: '#1A1A1A' },
};

function formatLabel(valueKop: number): string {
  if (valueKop < 100) {
    return `${valueKop} коп`;
  }
  const grn = Math.floor(valueKop / 100);
  const kop = valueKop % 100;
  return kop === 0 ? `${grn} грн` : `${grn} грн ${kop} коп`;
}

function shortLabel(valueKop: number): string {
  if (valueKop < 100) return `${valueKop}к`;
  const grn = valueKop / 100;
  return `${grn}`;
}

export function MoneyView({ valueKop, size = 'md' }: MoneyViewProps) {
  const palette = DENOMINATION_COLORS[valueKop] ?? { bg: '#D9D9D9', text: '#1A1A1A' };
  const isCoin = valueKop <= 1000; // up to 10 грн is coin
  const dims = sizeMap[size];

  if (isCoin) {
    return (
      <View
        style={[
          styles.coin,
          { backgroundColor: palette.bg, width: dims.coin, height: dims.coin, borderRadius: dims.coin / 2 },
        ]}
      >
        <AppText style={[styles.coinText, { fontSize: dims.coinFont, color: palette.text }]}>
          {shortLabel(valueKop)}
        </AppText>
        {valueKop < 100 ? (
          <AppText style={[styles.coinUnit, { color: palette.text, fontSize: dims.coinUnitFont }]}>
            коп
          </AppText>
        ) : (
          <AppText style={[styles.coinUnit, { color: palette.text, fontSize: dims.coinUnitFont }]}>
            грн
          </AppText>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bill,
        {
          backgroundColor: palette.bg,
          width: dims.bill,
          height: dims.billH,
        },
      ]}
    >
      <AppText style={[styles.billText, { fontSize: dims.billFont, color: palette.text }]}>
        {shortLabel(valueKop)}
      </AppText>
      <AppText style={[styles.billUnit, { color: palette.text, fontSize: dims.billUnitFont }]}>
        грн
      </AppText>
    </View>
  );
}

export function MoneyPile({
  items,
  size = 'md',
}: {
  items: MoneyUnit[];
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <View style={styles.pile}>
      {items.map((item, i) => (
        <MoneyView key={i} valueKop={item.valueKop} size={size} />
      ))}
    </View>
  );
}

export function formatAmount(totalKop: number): string {
  return formatLabel(totalKop);
}

const sizeMap = {
  sm: {
    coin: 40,
    coinFont: 16,
    coinUnitFont: 9,
    bill: 64,
    billH: 38,
    billFont: 18,
    billUnitFont: 10,
  },
  md: {
    coin: 56,
    coinFont: 22,
    coinUnitFont: 11,
    bill: 88,
    billH: 52,
    billFont: 26,
    billUnitFont: 12,
  },
  lg: {
    coin: 72,
    coinFont: 30,
    coinUnitFont: 13,
    bill: 110,
    billH: 68,
    billFont: 34,
    billUnitFont: 14,
  },
};

const styles = StyleSheet.create({
  pile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    ...shadows.card,
  },
  coinText: {
    fontFamily: fontFamily.extraBold,
  },
  coinUnit: {
    fontFamily: fontFamily.bold,
    marginTop: -2,
  },
  bill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    gap: 4,
    ...shadows.card,
  },
  billText: {
    fontFamily: fontFamily.extraBold,
  },
  billUnit: {
    fontFamily: fontFamily.bold,
  },
});
