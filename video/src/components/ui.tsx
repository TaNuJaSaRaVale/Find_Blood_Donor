import { C, monoFamily } from "../lib/theme";

export const Drop: React.FC<{ label: string; size?: number; color?: string; style?: React.CSSProperties }> = ({
  label,
  size = 90,
  color = C.red,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size * 1.1,
      background: color,
      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
      display: "grid",
      placeItems: "center",
      fontWeight: 800,
      fontSize: size * (label.length > 3 ? 0.22 : 0.34),
      color: "#fff",
      textAlign: "center",
      lineHeight: 1.05,
      boxShadow: `0 12px 30px ${color}55`,
      flexShrink: 0,
      whiteSpace: "pre-line",
      ...style,
    }}
  >
    {label}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accent?: string }> = ({
  children,
  style,
  accent,
}) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${accent ?? C.cardBorder}`,
      borderRadius: 22,
      padding: "26px 30px",
      backdropFilter: "blur(6px)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Code: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <pre
    style={{
      margin: 0,
      fontFamily: monoFamily,
      fontSize: 25,
      lineHeight: 1.5,
      color: "#fde68a",
      background: "rgba(0,0,0,0.45)",
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 16,
      padding: "20px 24px",
      whiteSpace: "pre",
      ...style,
    }}
  >
    {children}
  </pre>
);

export const Chip: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.red,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 22px",
      borderRadius: 999,
      background: `${color}26`,
      border: `2px solid ${color}`,
      fontWeight: 700,
      fontSize: 30,
      ...style,
    }}
  >
    {children}
  </div>
);
