import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface ClockFaceProps {
  hour: number; // 0-23
  minute: number; // 0-59
  size: number;
  showNumbers?: boolean;
}

export function ClockFace({ hour, minute, size, showNumbers = true }: ClockFaceProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const displayHour = hour % 12;

  const hourAngle = (displayHour * 30 + minute * 0.5 - 90) * (Math.PI / 180);
  const minuteAngle = (minute * 6 - 90) * (Math.PI / 180);

  const hourHandLength = r * 0.5;
  const minuteHandLength = r * 0.75;

  const hourX = cx + hourHandLength * Math.cos(hourAngle);
  const hourY = cy + hourHandLength * Math.sin(hourAngle);
  const minuteX = cx + minuteHandLength * Math.cos(minuteAngle);
  const minuteY = cy + minuteHandLength * Math.sin(minuteAngle);

  const tickOuter = r;
  const tickInner = r - size * 0.08;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} fill={colors.surface} stroke={colors.text} strokeWidth={size * 0.025} />

      {/* 12 hour ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = cx + tickOuter * Math.cos(angle);
        const y1 = cy + tickOuter * Math.sin(angle);
        const x2 = cx + tickInner * Math.cos(angle);
        const y2 = cy + tickInner * Math.sin(angle);
        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colors.text}
            strokeWidth={size * 0.02}
            strokeLinecap="round"
          />
        );
      })}

      {/* Numbers 12, 3, 6, 9 (optional for smaller sizes) */}
      {showNumbers && size >= 100 ? (
        <G>
          {[12, 3, 6, 9].map((num) => {
            const idx = num === 12 ? 0 : num;
            const angle = (idx * 30 - 90) * (Math.PI / 180);
            const tx = cx + (r - size * 0.18) * Math.cos(angle);
            const ty = cy + (r - size * 0.18) * Math.sin(angle);
            return (
              <SvgText
                key={num}
                x={tx}
                y={ty + size * 0.05}
                fontSize={size * 0.13}
                fontWeight="bold"
                fill={colors.text}
                textAnchor="middle"
              >
                {num}
              </SvgText>
            );
          })}
        </G>
      ) : null}

      {/* Hour hand */}
      <Line
        x1={cx}
        y1={cy}
        x2={hourX}
        y2={hourY}
        stroke={colors.text}
        strokeWidth={size * 0.05}
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <Line
        x1={cx}
        y1={cy}
        x2={minuteX}
        y2={minuteY}
        stroke={colors.primary}
        strokeWidth={size * 0.035}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={size * 0.04} fill={colors.primary} />
    </Svg>
  );
}
