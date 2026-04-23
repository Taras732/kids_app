import Svg, { Circle, Rect, Polygon, Ellipse, Path, G, Line } from 'react-native-svg';

export type ShapeId =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'oval'
  | 'rhombus'
  | 'pentagon'
  | 'hexagon'
  | 'cube'
  | 'cone'
  | 'cylinder';

interface ShapeViewProps {
  shape: ShapeId;
  color: string;
  size: number;
}

function darken(hex: string): string {
  const m = hex.match(/^#?([a-f0-9]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function ShapeView({ shape, color, size }: ShapeViewProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s / 2 - 2;

  if (shape === 'circle') {
    return (
      <Svg width={s} height={s}>
        <Circle cx={cx} cy={cy} r={r} fill={color} />
      </Svg>
    );
  }

  if (shape === 'square') {
    return (
      <Svg width={s} height={s}>
        <Rect x={2} y={2} width={s - 4} height={s - 4} fill={color} rx={4} />
      </Svg>
    );
  }

  if (shape === 'rectangle') {
    const w = s - 4;
    const h = s * 0.6;
    const y = (s - h) / 2;
    return (
      <Svg width={s} height={s}>
        <Rect x={2} y={y} width={w} height={h} fill={color} rx={4} />
      </Svg>
    );
  }

  if (shape === 'triangle') {
    const top = `${cx},4`;
    const bl = `4,${s - 4}`;
    const br = `${s - 4},${s - 4}`;
    return (
      <Svg width={s} height={s}>
        <Polygon points={`${top} ${bl} ${br}`} fill={color} />
      </Svg>
    );
  }

  if (shape === 'oval') {
    const rx = s / 2 - 2;
    const ry = (s / 2) * 0.65;
    return (
      <Svg width={s} height={s}>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />
      </Svg>
    );
  }

  if (shape === 'rhombus') {
    const pts = `${cx},4 ${s - 4},${cy} ${cx},${s - 4} 4,${cy}`;
    return (
      <Svg width={s} height={s}>
        <Polygon points={pts} fill={color} />
      </Svg>
    );
  }

  if (shape === 'pentagon') {
    const pts = regularPolygonPoints(cx, cy, r, 5, -Math.PI / 2);
    return (
      <Svg width={s} height={s}>
        <Polygon points={pts} fill={color} />
      </Svg>
    );
  }

  if (shape === 'hexagon') {
    const pts = regularPolygonPoints(cx, cy, r, 6, 0);
    return (
      <Svg width={s} height={s}>
        <Polygon points={pts} fill={color} />
      </Svg>
    );
  }

  if (shape === 'cube') {
    // 2D isometric projection
    const d = darken(color);
    const dd = darken(d);
    const w = s * 0.55;
    const h = s * 0.55;
    const off = s * 0.18;
    const x0 = 4;
    const y0 = off + 4;
    // front face
    const frontPts = `${x0},${y0} ${x0 + w},${y0} ${x0 + w},${y0 + h} ${x0},${y0 + h}`;
    // top face (rhombus-like)
    const topPts = `${x0},${y0} ${x0 + off},${y0 - off} ${x0 + w + off},${y0 - off} ${x0 + w},${y0}`;
    // right face
    const rightPts = `${x0 + w},${y0} ${x0 + w + off},${y0 - off} ${x0 + w + off},${y0 + h - off} ${x0 + w},${y0 + h}`;
    return (
      <Svg width={s} height={s}>
        <Polygon points={frontPts} fill={color} />
        <Polygon points={topPts} fill={d} />
        <Polygon points={rightPts} fill={dd} />
      </Svg>
    );
  }

  if (shape === 'cone') {
    const d = darken(color);
    const apex = { x: cx, y: 6 };
    const baseLeft = { x: 8, y: s - 10 };
    const baseRight = { x: s - 8, y: s - 10 };
    const rx = (baseRight.x - baseLeft.x) / 2;
    const baseCy = s - 10;
    const sidePath = `M ${apex.x} ${apex.y} L ${baseLeft.x} ${baseCy} A ${rx} ${rx * 0.32} 0 0 0 ${baseRight.x} ${baseCy} Z`;
    return (
      <Svg width={s} height={s}>
        <Path d={sidePath} fill={color} />
        <Path
          d={`M ${baseLeft.x} ${baseCy} A ${rx} ${rx * 0.32} 0 0 1 ${baseRight.x} ${baseCy} A ${rx} ${rx * 0.32} 0 0 1 ${baseLeft.x} ${baseCy} Z`}
          fill={d}
        />
      </Svg>
    );
  }

  if (shape === 'cylinder') {
    const d = darken(color);
    const rx = s / 2 - 6;
    const ry = rx * 0.25;
    const topY = 10;
    const bottomY = s - 10;
    return (
      <Svg width={s} height={s}>
        {/* body */}
        <Rect x={cx - rx} y={topY} width={rx * 2} height={bottomY - topY} fill={color} />
        {/* bottom ellipse (darker) */}
        <Ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill={d} />
        {/* top ellipse (lighter) */}
        <Ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={color} />
        <Line x1={cx - rx} y1={topY} x2={cx - rx} y2={bottomY} stroke={d} strokeWidth={1} />
        <Line x1={cx + rx} y1={topY} x2={cx + rx} y2={bottomY} stroke={d} strokeWidth={1} />
        <G>
          <Path
            d={`M ${cx - rx} ${topY} A ${rx} ${ry} 0 0 1 ${cx + rx} ${topY}`}
            stroke={d}
            strokeWidth={1}
            fill="none"
          />
        </G>
      </Svg>
    );
  }

  return null;
}

function regularPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  startAngleRad: number,
): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = startAngleRad + (i * 2 * Math.PI) / sides;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(' ');
}
