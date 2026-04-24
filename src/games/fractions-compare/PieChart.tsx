import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface PieChartProps {
  numerator: number;
  denominator: number;
  size: number;
  color?: string;
}

export function PieChart({ numerator, denominator, size, color = colors.primary }: PieChartProps) {
  const radius = size / 2 - 3;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = colors.text;
  const strokeWidth = 2;

  if (denominator === 1) {
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={numerator >= 1 ? color : 'transparent'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size}>
      {Array.from({ length: denominator }).map((_, i) => {
        const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
        const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        const filled = i < numerator;
        return (
          <Path
            key={i}
            d={path}
            fill={filled ? color : 'transparent'}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </Svg>
  );
}
