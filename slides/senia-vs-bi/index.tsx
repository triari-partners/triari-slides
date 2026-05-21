import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

// ─── Panel-tweakable design tokens (Triari v3) ───────────────────────────────
// Triari v3 palette + Geist typography. Edit live from the Design panel.
export const design: DesignSystem = {
  palette: {
    bg: '#EEF5F0',
    text: '#0A2A1C',
    accent: '#7CF0A8',
  },
  fonts: {
    display:
      '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    body: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  },
  typeScale: {
    hero: 168,
    body: 36,
  },
  radius: 10,
};

// ─── Local palette (full Triari v3 token set) ────────────────────────────────
const palette = {
  bf: design.palette.text,
  mint: design.palette.accent,
  lime: '#EFF8A8',
  teal: '#86BAA1',
  off: design.palette.bg,
  surface: '#FFFFFF',
  textOnDark: '#FFFFFF',
  textSoftDark: 'rgba(255,255,255,0.72)',
  textMutedDark: 'rgba(255,255,255,0.48)',
  textSoft: 'rgba(10,42,28,0.74)',
  textMuted: 'rgba(10,42,28,0.52)',
  border: 'rgba(10,42,28,0.10)',
  borderDark: 'rgba(255,255,255,0.14)',
  warn: '#E89A6A',
  warnSoft: 'rgba(232,154,106,0.18)',
};

const font = {
  body: design.fonts.body,
  display: design.fonts.display,
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

const fill = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  fontFamily: 'var(--osd-font-body)',
  letterSpacing: '-0.012em',
};

// ─── Shared animations ───────────────────────────────────────────────────────
const styles = `
  @import url('https://cdn.jsdelivr.net/fontsource/css/geist@latest/index.css');
  @import url('https://cdn.jsdelivr.net/fontsource/css/geist-mono@latest/index.css');

  @keyframes sv-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sv-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sv-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes sv-pulseWarn {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,154,106,0.55); }
    50%      { box-shadow: 0 0 0 14px rgba(232,154,106,0); }
  }
  @keyframes sv-dashflow {
    to { stroke-dashoffset: -40; }
  }
  .sv-fadeUp { opacity: 0; animation: sv-fadeUp 0.85s cubic-bezier(.2,.7,.2,1) forwards; }
  .sv-fadeIn { opacity: 0; animation: sv-fadeIn 1s ease forwards; }
  .sv-spinSlow { animation: sv-spin 60s linear infinite; transform-origin: center; }
  .sv-pulseWarn { animation: sv-pulseWarn 2.2s ease-in-out infinite; }
  .sv-dashflow { animation: sv-dashflow 2s linear infinite; }
`;

const Styles = () => <style>{styles}</style>;

// ─── Shared chrome ───────────────────────────────────────────────────────────
const Eyebrow = ({
  children,
  color,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      fontFamily: font.mono,
      fontSize: 20,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: color ?? palette.textMuted,
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </div>
);

const Footer = ({ dark, pageNumber }: { dark?: boolean; pageNumber: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 100,
      right: 100,
      bottom: 56,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: font.mono,
      fontSize: 18,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: dark ? palette.textMutedDark : palette.textMuted,
    }}
  >
    <span>Triari · Senia</span>
    <span>
      {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ 14</span>
    </span>
  </div>
);

// ─── Flywheel SVG (shared between slides 2, 3, 4, 12) ────────────────────────
// Renders a 4-node flywheel. `state[i]` controls the visual state of node i+1:
//   'on'      — accented, the canonical flywheel.
//   'stuck'   — warning ring, broken outgoing arc.
//   'muted'   — dim, not in focus on this slide.
const FlywheelNodeLabels = ['Datos', 'Diagnóstico', 'Decisión', 'Acción'] as const;

type NodeState = 'on' | 'stuck' | 'muted';

const Flywheel = ({
  size = 720,
  state = ['on', 'on', 'on', 'on'] as NodeState[],
  highlightLearning = true,
  dark = false,
}: {
  size?: number;
  state?: NodeState[];
  highlightLearning?: boolean;
  dark?: boolean;
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.405;
  const nodeR = size * 0.094;

  const baseStroke = dark ? 'rgba(255,255,255,0.18)' : 'rgba(10,42,28,0.18)';
  const baseText = dark ? palette.textOnDark : palette.bf;
  const baseSoft = dark ? palette.textSoftDark : palette.textSoft;

  // Node angles: top, right, bottom, left
  const angles = [-90, 0, 90, 180];
  const nodes = angles.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return {
      i,
      label: FlywheelNodeLabels[i],
      cx: cx + r * Math.cos(rad),
      cy: cy + r * Math.sin(rad),
      state: state[i] ?? 'on',
    };
  });

  // Arc from node i to node i+1 (around the circle).
  const arcPath = (i: number) => {
    const from = nodes[i];
    const to = nodes[(i + 1) % 4];
    // Use the same radius, large-arc=0, sweep=1 (clockwise).
    return `M ${from.cx} ${from.cy} A ${r} ${r} 0 0 1 ${to.cx} ${to.cy}`;
  };

  const arcColor = (i: number) => {
    const from = nodes[i];
    const to = nodes[(i + 1) % 4];
    if (from.state === 'stuck' || to.state === 'stuck') return palette.warn;
    if (from.state === 'muted' && to.state === 'muted') return baseStroke;
    return palette.mint;
  };

  const arcOpacity = (i: number) => {
    const from = nodes[i];
    const to = nodes[(i + 1) % 4];
    if (from.state === 'muted' && to.state === 'muted') return 0.6;
    return 1;
  };

  const nodeFill = (s: NodeState) => {
    if (s === 'on') return dark ? palette.mint : palette.mint;
    if (s === 'stuck') return dark ? palette.warnSoft : '#F8D8C5';
    return dark ? 'rgba(255,255,255,0.06)' : 'rgba(10,42,28,0.04)';
  };
  const nodeStroke = (s: NodeState) => {
    if (s === 'on') return dark ? palette.mint : palette.bf;
    if (s === 'stuck') return palette.warn;
    return baseStroke;
  };
  const nodeTextColor = (s: NodeState) => {
    if (s === 'on') return palette.bf;
    if (s === 'stuck') return palette.warn;
    return baseSoft;
  };

  const arrowHeadSize = 14;
  // Place arrowhead on the receiving node's edge, pointing along the tangent.
  const arrowHeadFor = (i: number) => {
    const to = nodes[(i + 1) % 4];
    // Tangent direction at the "to" node for a clockwise circle:
    // perpendicular to the radius (from center to node), rotated -90deg.
    const radialX = to.cx - cx;
    const radialY = to.cy - cy;
    const tangentX = radialY;
    const tangentY = -radialX;
    const len = Math.hypot(tangentX, tangentY);
    const tx = tangentX / len;
    const ty = tangentY / len;
    // Arrowhead tip sits just outside the node circle edge.
    const tipX = to.cx - tx * (nodeR + 6);
    const tipY = to.cy - ty * (nodeR + 6);
    // Build the triangle.
    const px = -ty;
    const py = tx;
    const baseX = tipX - tx * arrowHeadSize;
    const baseY = tipY - ty * arrowHeadSize;
    const a = `${tipX},${tipY}`;
    const b = `${baseX + px * arrowHeadSize * 0.55},${baseY + py * arrowHeadSize * 0.55}`;
    const c = `${baseX - px * arrowHeadSize * 0.55},${baseY - py * arrowHeadSize * 0.55}`;
    return { points: `${a} ${b} ${c}`, color: arcColor(i) };
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Soft halo behind the wheel when learning is highlighted */}
      {highlightLearning && (
        <circle
          cx={cx}
          cy={cy}
          r={r + nodeR + 28}
          fill="none"
          stroke={dark ? 'rgba(124,240,168,0.18)' : 'rgba(124,240,168,0.45)'}
          strokeWidth={1.5}
          strokeDasharray="2 8"
        />
      )}

      {/* Arcs between nodes */}
      {[0, 1, 2, 3].map((i) => {
        const stuck =
          nodes[i].state === 'stuck' || nodes[(i + 1) % 4].state === 'stuck';
        const muted =
          nodes[i].state === 'muted' && nodes[(i + 1) % 4].state === 'muted';
        return (
          <g key={`arc-${i}`} opacity={arcOpacity(i)}>
            <path
              d={arcPath(i)}
              fill="none"
              stroke={arcColor(i)}
              strokeWidth={muted ? 2 : 4}
              strokeLinecap="round"
              strokeDasharray={stuck ? '6 12' : undefined}
            />
            {!muted && (
              <polygon
                points={arrowHeadFor(i).points}
                fill={arrowHeadFor(i).color}
              />
            )}
          </g>
        );
      })}

      {/* Central learning marker */}
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={nodeR * 0.92}
          fill={dark ? 'rgba(124,240,168,0.10)' : 'rgba(124,240,168,0.20)'}
          stroke={palette.mint}
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontFamily={font.mono}
          fontSize={size * 0.024}
          fontWeight={600}
          fill={dark ? palette.textOnDark : palette.bf}
          letterSpacing="0.14em"
        >
          APRENDIZAJE
        </text>
        <text
          x={cx}
          y={cy + size * 0.026}
          textAnchor="middle"
          fontFamily={font.body}
          fontSize={size * 0.022}
          fill={baseSoft}
        >
          cada vuelta cuenta
        </text>
      </g>

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={n.cx}
            cy={n.cy}
            r={nodeR}
            fill={nodeFill(n.state)}
            stroke={nodeStroke(n.state)}
            strokeWidth={n.state === 'on' ? 2.5 : 2}
          />
          {/* Numeral */}
          <text
            x={n.cx}
            y={n.cy - 6}
            textAnchor="middle"
            fontFamily={font.mono}
            fontSize={size * 0.028}
            fontWeight={600}
            fill={nodeTextColor(n.state)}
            letterSpacing="0.08em"
          >
            {`0${i + 1}`}
          </text>
          <text
            x={n.cx}
            y={n.cy + size * 0.028}
            textAnchor="middle"
            fontFamily={font.display}
            fontSize={size * 0.026}
            fontWeight={500}
            fill={nodeTextColor(n.state)}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 01 — Portada
// ═════════════════════════════════════════════════════════════════════════════

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.bf,
      color: palette.textOnDark,
      padding: '120px 140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Styles />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Eyebrow color={palette.textMutedDark} style={{ color: palette.mint }}>
        Triari · Senia
      </Eyebrow>
      <Eyebrow color={palette.textMutedDark}>Sales deck · v1</Eyebrow>
    </div>

    <div className="sv-fadeUp" style={{ animationDelay: '0.1s' }}>
      <div
        style={{
          fontFamily: font.mono,
          fontSize: 22,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: palette.mint,
          marginBottom: 36,
        }}
      >
        El flywheel de toma de decisiones
      </div>
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 168,
          fontWeight: 300,
          lineHeight: 0.96,
          letterSpacing: '-0.04em',
          margin: 0,
        }}
      >
        Senia
        <br />
        <span style={{ color: palette.textMutedDark, fontWeight: 200 }}>vs</span>
        <br />
        BI tradicional
      </h1>
      <p
        style={{
          marginTop: 48,
          maxWidth: 1100,
          fontSize: 32,
          lineHeight: 1.45,
          color: palette.textSoftDark,
          fontWeight: 300,
        }}
      >
        Por qué el cuadro de mandos clásico se quedó corto — y qué cambia
        cuando un agente cierra el ciclo.
      </p>
    </div>

    <div
      style={{
        display: 'flex',
        gap: 56,
        fontFamily: font.mono,
        fontSize: 18,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: palette.textMutedDark,
      }}
    >
      <span>
        <span style={{ color: palette.mint }}>01</span>&nbsp;&nbsp;Datos
      </span>
      <span>
        <span style={{ color: palette.mint }}>02</span>&nbsp;&nbsp;Diagnóstico
      </span>
      <span>
        <span style={{ color: palette.mint }}>03</span>&nbsp;&nbsp;Decisión
      </span>
      <span>
        <span style={{ color: palette.mint }}>04</span>&nbsp;&nbsp;Acción
      </span>
      <span style={{ color: palette.mint, display: 'inline-flex', alignItems: 'center' }}>
        <LoopIcon size={18} stroke={1.8} />
      </span>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 02 — El flywheel (hero diagram)
// ═════════════════════════════════════════════════════════════════════════════

const FlywheelHero: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '90px 120px',
    }}
  >
    <Styles />
    <Eyebrow>02 · El flywheel</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 76,
        fontWeight: 300,
        lineHeight: 1.05,
        letterSpacing: '-0.025em',
        margin: '20px 0 0',
        maxWidth: 880,
      }}
    >
      Toda empresa gira sobre el mismo bucle
      <span style={{ color: palette.teal }}>.</span>
    </h2>
    <p
      style={{
        marginTop: 28,
        fontSize: 26,
        lineHeight: 1.5,
        color: palette.textSoft,
        maxWidth: 880,
        fontWeight: 400,
      }}
    >
      Datos que entran, diagnóstico que los interpreta, decisión que los activa,
      acción que los ejecuta. Y el resultado vuelve al sistema.
    </p>

    <div
      style={{
        position: 'absolute',
        right: 100,
        top: 110,
        bottom: 150,
        width: 820,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Flywheel size={780} state={['on', 'on', 'on', 'on']} />
    </div>

    <div
      style={{
        position: 'absolute',
        left: 120,
        bottom: 130,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontFamily: font.mono,
        fontSize: 22,
        color: palette.textSoft,
        letterSpacing: '0.04em',
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          background: palette.mint,
          borderRadius: 999,
          display: 'inline-block',
        }}
      />
      <span>La velocidad del flywheel = velocidad de decisión del negocio.</span>
    </div>
    <Footer pageNumber={2} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 03 — El flywheel roto 1/2 (eslabones 1 y 2)
// ═════════════════════════════════════════════════════════════════════════════

const StuckPanel = ({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: React.ReactNode;
}) => (
  <div
    style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 10,
      padding: '36px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontFamily: font.mono,
        fontSize: 20,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: palette.warn,
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: palette.warnSoft,
          color: palette.warn,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        {num}
      </span>
      <span>Eslabón atascado</span>
    </div>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 36,
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: '-0.015em',
        color: palette.bf,
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: 22,
        lineHeight: 1.55,
        color: palette.textSoft,
      }}
    >
      {body}
    </div>
  </div>
);

const FlywheelBroken1: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <Eyebrow>03 · El flywheel roto · 1 de 2</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.05,
        letterSpacing: '-0.022em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      Hoy el flywheel se atasca en 4 puntos.
    </h2>

    <div
      style={{
        marginTop: 40,
        display: 'grid',
        gridTemplateColumns: '440px 1fr',
        gap: 56,
        alignItems: 'start',
      }}
    >
      <div style={{ paddingTop: 8 }}>
        <Flywheel size={420} state={['stuck', 'stuck', 'muted', 'muted']} highlightLearning={false} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 880 }}>
        <StuckPanel
          num="01"
          title="Dashboard entrega datos, no diagnóstico."
          body={
            <>
              Te dice que las ventas caen un 8%. No te dice por qué, ni dónde
              se concentra, ni cuánto pesa en el negocio. El analista vuelve
              a cruzar gráficos a mano.
            </>
          }
        />
        <StuckPanel
          num="02"
          title="Decisión desconectada del plan."
          body={
            <>
              El BI enseña lo que pasa, pero no recuerda qué habíais decidido
              hacer al respecto. Cada decisión hay que volver a anclarla en
              prioridades a mano.
            </>
          }
        />
      </div>
    </div>

    <Footer pageNumber={3} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 04 — El flywheel roto 2/2 (eslabones 3 y 4)
// ═════════════════════════════════════════════════════════════════════════════

const FlywheelBroken2: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <Eyebrow>04 · El flywheel roto · 2 de 2</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.05,
        letterSpacing: '-0.022em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      Cuatro saltos, cuatro fricciones, cero aprendizaje.
    </h2>

    <div
      style={{
        marginTop: 40,
        display: 'grid',
        gridTemplateColumns: '440px 1fr',
        gap: 56,
        alignItems: 'start',
      }}
    >
      <div style={{ paddingTop: 8 }}>
        <Flywheel size={420} state={['muted', 'muted', 'stuck', 'stuck']} highlightLearning={false} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 880 }}>
        <StuckPanel
          num="03"
          title="Acción lejos del dashboard."
          body={
            <>
              La acción ocurre en otra plataforma — CRM, email, calendario —
              con copy-paste y saltos manuales. Tiempo perdido, información
              que se queda por el camino.
            </>
          }
        />
        <StuckPanel
          num="04"
          title="Aprendizaje que se evapora."
          body={
            <>
              El resultado no vuelve al sistema. La próxima vez empezáis de
              cero, sin memoria de lo que funcionó. El flywheel no gira:
              se arrastra.
            </>
          }
        />
      </div>
    </div>

    <Footer pageNumber={4} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 05 — No es chatbot, es agente
// ═════════════════════════════════════════════════════════════════════════════

const ComparePanel = ({
  kicker,
  title,
  bullets,
  tone,
}: {
  kicker: string;
  title: string;
  bullets: string[];
  tone: 'pale' | 'accent';
}) => (
  <div
    style={{
      background: tone === 'accent' ? palette.bf : palette.surface,
      color: tone === 'accent' ? palette.textOnDark : palette.bf,
      border:
        tone === 'accent' ? `1px solid ${palette.bf}` : `1px solid ${palette.border}`,
      borderRadius: 10,
      padding: '48px 52px',
      display: 'flex',
      flexDirection: 'column',
      gap: 28,
      flex: 1,
    }}
  >
    <Eyebrow
      color={tone === 'accent' ? palette.mint : palette.textMuted}
      style={{ fontSize: 18 }}
    >
      {kicker}
    </Eyebrow>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 56,
        fontWeight: 300,
        lineHeight: 1.05,
        letterSpacing: '-0.025em',
      }}
    >
      {title}
    </div>
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {bullets.map((b, i) => (
        <li
          key={i}
          style={{
            fontSize: 24,
            lineHeight: 1.45,
            color: tone === 'accent' ? palette.textSoftDark : palette.textSoft,
            display: 'flex',
            gap: 14,
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: tone === 'accent' ? palette.mint : palette.teal,
              flexShrink: 0,
              transform: 'translateY(-3px)',
            }}
          />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </div>
);

const AgentVsChatbot: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <Eyebrow>05 · Qué es Senia</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.05,
        letterSpacing: '-0.022em',
        margin: '20px 0 0',
        maxWidth: 1600,
      }}
    >
      Un chatbot responde. Un agente planifica, decide, ejecuta y aprende.
    </h2>

    <div style={{ marginTop: 60, display: 'flex', gap: 32 }}>
      <ComparePanel
        kicker="Chatbot"
        title="Responde a tu pregunta."
        bullets={[
          'Espera al prompt humano para cada paso.',
          'No tiene acceso a tus herramientas.',
          'Olvida el contexto entre conversaciones.',
        ]}
        tone="pale"
      />
      <ComparePanel
        kicker="Senia · agente"
        title="Mueve el flywheel."
        bullets={[
          'Planifica varios pasos por adelantado.',
          'Ejecuta en tus plataformas vía MCP.',
          'Acumula memoria operativa, mejora cada vuelta.',
        ]}
        tone="accent"
      />
    </div>

    <Footer pageNumber={5} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 06 — Eslabón 1: Diagnóstico
// ═════════════════════════════════════════════════════════════════════════════

const BeforeAfter = ({
  label,
  title,
  lines,
  tone,
}: {
  label: string;
  title: string;
  lines: string[];
  tone: 'before' | 'after';
}) => (
  <div
    style={{
      background: tone === 'after' ? palette.bf : palette.surface,
      color: tone === 'after' ? palette.textOnDark : palette.bf,
      border: `1px solid ${tone === 'after' ? palette.bf : palette.border}`,
      borderRadius: 10,
      padding: '40px 44px',
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      flex: 1,
    }}
  >
    <Eyebrow color={tone === 'after' ? palette.mint : palette.textMuted}>{label}</Eyebrow>
    <div
      style={{
        fontFamily: font.display,
        fontSize: 40,
        fontWeight: 400,
        lineHeight: 1.15,
        letterSpacing: '-0.018em',
      }}
    >
      {title}
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontSize: 22,
        lineHeight: 1.5,
        color: tone === 'after' ? palette.textSoftDark : palette.textSoft,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  </div>
);

const Eslabon1: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Eyebrow>06 · Eslabón 01 desbloqueado</Eyebrow>
      <Eyebrow color={palette.teal}>Datos → Diagnóstico</Eyebrow>
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 72,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '24px 0 0',
        maxWidth: 1500,
      }}
    >
      Del dato a la conclusión accionable.
    </h2>

    <div style={{ marginTop: 56, display: 'flex', gap: 32 }}>
      <BeforeAfter
        label="BI tradicional"
        title="Te entrega gráficos."
        lines={[
          '"Las ventas caen un 8% este mes."',
          'Tú o tu analista cruzáis tablas a mano para entender por qué.',
          'La interpretación es trabajo humano.',
        ]}
        tone="before"
      />
      <BeforeAfter
        label="Senia"
        title="Te entrega la conclusión."
        lines={[
          'Caída concentrada en el segmento Pyme · región Norte.',
          'Patrón consistente con la pérdida de 3 cuentas clave de Q1.',
          'Impacto estimado en ARR: −€420k. Acción sugerida priorizada.',
        ]}
        tone="after"
      />
    </div>

    <Footer pageNumber={6} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 07 — Eslabón 2: Decisión anclada al plan
// ═════════════════════════════════════════════════════════════════════════════

const Eslabon2: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Eyebrow>07 · Eslabón 02 desbloqueado</Eyebrow>
      <Eyebrow color={palette.teal}>Diagnóstico → Decisión</Eyebrow>
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 72,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '24px 0 0',
        maxWidth: 1500,
      }}
    >
      Cada decisión, alineada con la estrategia.
    </h2>

    <div
      style={{
        marginTop: 56,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <p style={{ fontSize: 26, lineHeight: 1.55, color: palette.textSoft, margin: 0 }}>
          Senia no propone acciones genéricas. Conecta el diagnóstico con vuestros
          OKRs y los ítems del plan, y justifica por qué la acción sugerida encaja.
        </p>
        <p style={{ fontSize: 26, lineHeight: 1.55, color: palette.textSoft, margin: 0 }}>
          La decisión deja de ser <em>"qué hago"</em> y pasa a ser{' '}
          <strong style={{ color: palette.bf }}>"qué activo de lo que ya habíamos decidido hacer"</strong>.
        </p>
      </div>

      <div
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 10,
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <Eyebrow color={palette.textMuted}>Sugerencia priorizada</Eyebrow>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: font.mono,
            fontSize: 18,
            color: palette.teal,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              background: 'rgba(134,186,161,0.18)',
              fontWeight: 600,
            }}
          >
            OKR Q2
          </span>
          <span style={{ color: palette.textMuted }}>· Retención Pyme</span>
        </div>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 30,
            fontWeight: 400,
            lineHeight: 1.25,
            letterSpacing: '-0.012em',
          }}
        >
          Reactivar el playbook de recuperación de cuentas Norte priorizado en
          el plan trimestral.
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            fontFamily: font.mono,
            fontSize: 16,
            color: palette.textSoft,
          }}
        >
          <span
            style={{
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: 4,
            }}
          >
            Impacto: alto
          </span>
          <span
            style={{
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: 4,
            }}
          >
            Esfuerzo: medio
          </span>
          <span
            style={{
              padding: '6px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: 4,
            }}
          >
            Owner: Comercial
          </span>
        </div>
      </div>
    </div>

    <Footer pageNumber={7} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 08 — Eslabón 3: Acción vía MCP
// ═════════════════════════════════════════════════════════════════════════════

const McpNode = ({
  label,
  sub,
  cx,
  cy,
}: {
  label: string;
  sub: string;
  cx: number;
  cy: number;
}) => (
  <g>
    <rect
      x={cx - 95}
      y={cy - 36}
      width={190}
      height={72}
      rx={10}
      fill={palette.surface}
      stroke={palette.border}
      strokeWidth={1.5}
    />
    <text
      x={cx}
      y={cy - 6}
      textAnchor="middle"
      fontFamily={font.display}
      fontSize={20}
      fontWeight={500}
      fill={palette.bf}
    >
      {label}
    </text>
    <text
      x={cx}
      y={cy + 18}
      textAnchor="middle"
      fontFamily={font.mono}
      fontSize={13}
      fill={palette.textMuted}
      letterSpacing="0.1em"
    >
      {sub}
    </text>
  </g>
);

const McpDiagram = () => {
  const W = 1680;
  const H = 540;

  // Senia hub on left + MCP pill in the middle.
  const seniaCx = 160;
  const seniaCy = H / 2;
  const seniaR = 110;

  // MCP rail just to the right of the hub.
  const mcpW = 180;
  const mcpH = 84;
  const mcpX = 340;
  const mcpY = seniaCy - mcpH / 2;
  const mcpRight = mcpX + mcpW;
  const mcpAnchorX = mcpX + mcpW / 2;

  // 5 systems in a 3-column × 2-row grid on the right.
  const gridLeft = 740;
  const colGap = 40;
  const cellW = 280;
  const rowGap = 30;
  const cellH = 120;
  const systems: { label: string; sub: string; col: number; row: number }[] = [
    { label: 'CRM', sub: 'leads · cuentas', col: 0, row: 0 },
    { label: 'ERP', sub: 'facturación · stock', col: 1, row: 0 },
    { label: 'Email', sub: 'comercial · ops', col: 2, row: 0 },
    { label: 'Calendario', sub: 'meetings · slots', col: 0, row: 1 },
    { label: 'Mensajería', sub: 'equipo interno', col: 1, row: 1 },
  ];

  const gridTop = seniaCy - (cellH * 2 + rowGap) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {/* Senia hub */}
      <circle cx={seniaCx} cy={seniaCy} r={seniaR} fill={palette.bf} stroke={palette.bf} strokeWidth={1} />
      <text
        x={seniaCx}
        y={seniaCy - 8}
        textAnchor="middle"
        fontFamily={font.display}
        fontSize={36}
        fontWeight={400}
        fill={palette.textOnDark}
      >
        Senia
      </text>
      <text
        x={seniaCx}
        y={seniaCy + 26}
        textAnchor="middle"
        fontFamily={font.mono}
        fontSize={14}
        fill={palette.mint}
        letterSpacing="0.16em"
      >
        AGENTE
      </text>

      {/* Senia → MCP link */}
      <line
        x1={seniaCx + seniaR}
        y1={seniaCy}
        x2={mcpX}
        y2={seniaCy}
        stroke={palette.mint}
        strokeWidth={2.5}
      />

      {/* MCP pill */}
      <g>
        <rect
          x={mcpX}
          y={mcpY}
          width={mcpW}
          height={mcpH}
          rx={mcpH / 2}
          fill="rgba(124,240,168,0.18)"
          stroke={palette.mint}
          strokeWidth={1.6}
        />
        <text
          x={mcpAnchorX}
          y={mcpY + 34}
          textAnchor="middle"
          fontFamily={font.mono}
          fontSize={18}
          fill={palette.bf}
          fontWeight={600}
          letterSpacing="0.16em"
        >
          MCP
        </text>
        <text
          x={mcpAnchorX}
          y={mcpY + 60}
          textAnchor="middle"
          fontFamily={font.body}
          fontSize={14}
          fill={palette.textSoft}
        >
          estándar abierto
        </text>
      </g>

      {/*
        MCP → systems: route through a vertical manifold just before the grid
        so connector lines never cross other cards on their way to a target.
        Connector layer is rendered first, then all cards on top, so the
        terminating segment never visually intrudes on the destination card.
      */}
      {(() => {
        const trunkX = gridLeft - 36;
        const topCardY = gridTop + cellH / 2;
        const bottomCardY = gridTop + cellH + rowGap + cellH / 2;
        const lineColor = 'rgba(10,42,28,0.28)';
        return (
          <g>
            {/* MCP right edge → trunk */}
            <line
              x1={mcpRight}
              y1={seniaCy}
              x2={trunkX}
              y2={seniaCy}
              stroke={lineColor}
              strokeWidth={1.5}
              strokeDasharray="4 6"
            />
            {/* Vertical trunk between the two row centers */}
            <line
              x1={trunkX}
              y1={topCardY}
              x2={trunkX}
              y2={bottomCardY}
              stroke={lineColor}
              strokeWidth={1.5}
              strokeDasharray="4 6"
            />
            {/* Branches into each card's left edge */}
            {systems.map((sys, i) => {
              const x = gridLeft + sys.col * (cellW + colGap) + cellW / 2;
              const y = gridTop + sys.row * (cellH + rowGap) + cellH / 2;
              return (
                <line
                  key={`branch-${i}`}
                  x1={trunkX}
                  y1={y}
                  x2={x - cellW / 2}
                  y2={y}
                  stroke={lineColor}
                  strokeWidth={1.5}
                  strokeDasharray="4 6"
                />
              );
            })}
          </g>
        );
      })()}
      {/* System cards (rendered on top of the connector lines) */}
      {systems.map((sys, i) => {
        const x = gridLeft + sys.col * (cellW + colGap) + cellW / 2;
        const y = gridTop + sys.row * (cellH + rowGap) + cellH / 2;
        return (
          <g key={i}>
            <rect
              x={x - cellW / 2}
              y={y - cellH / 2}
              width={cellW}
              height={cellH}
              rx={10}
              fill={palette.surface}
              stroke={palette.border}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y - 6}
              textAnchor="middle"
              fontFamily={font.display}
              fontSize={26}
              fontWeight={500}
              fill={palette.bf}
            >
              {sys.label}
            </text>
            <text
              x={x}
              y={y + 26}
              textAnchor="middle"
              fontFamily={font.mono}
              fontSize={14}
              fill={palette.textMuted}
              letterSpacing="0.1em"
            >
              {sys.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Eslabon3MCP: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '90px 120px',
    }}
  >
    <Styles />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Eyebrow>08 · Eslabón 03 desbloqueado</Eyebrow>
      <Eyebrow color={palette.teal}>Decisión → Acción</Eyebrow>
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      Senia ejecuta donde tu equipo trabaja.
    </h2>

    <div style={{ marginTop: 28 }}>
      <McpDiagram />
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 28,
        marginTop: 24,
      }}
    >
      {[
        {
          k: 'Auditable',
          v: 'Cada acción queda trazada. Quién, cuándo, sobre qué dato.',
        },
        {
          k: 'Granular',
          v: 'Permisos por plataforma y por tipo de operación. No es caja negra.',
        },
        {
          k: 'Extensible',
          v: 'Cada nuevo conector MCP del ecosistema, disponible sin reescribir nada.',
        },
      ].map((it) => (
        <div
          key={it.k}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: font.mono,
              fontSize: 16,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: palette.mint,
              fontWeight: 600,
            }}
          >
            {it.k}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.5, color: palette.textSoft }}>{it.v}</div>
        </div>
      ))}
    </div>

    <Footer pageNumber={8} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 09 — Eslabón 4: Memoria
// ═════════════════════════════════════════════════════════════════════════════

const MemoryDiagram = () => {
  const W = 1680;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2;

  // Central card geometry.
  const cardHalfW = 280;
  const cardHalfH = 130;
  const cardLeft = cx - cardHalfW;
  const cardRight = cx + cardHalfW;

  // Arrow geometry — clearly outside the card with a generous gap.
  const arrowGap = 36;
  const inboundEndX = cardLeft - arrowGap;
  const outboundStartX = cardRight + arrowGap;
  const arrowHead = 14;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {/* Stacked memory layers (cards behind a central one) */}
      {[3, 2, 1, 0].map((i) => (
        <rect
          key={i}
          x={cardLeft + i * 8}
          y={cy - cardHalfH + i * 8}
          width={cardHalfW * 2 - i * 16}
          height={cardHalfH * 2 - i * 16}
          rx={12}
          fill={palette.surface}
          stroke={palette.border}
          opacity={1 - i * 0.18}
        />
      ))}
      {/* Top card content */}
      <text
        x={cardLeft + 28}
        y={cy - 76}
        fontFamily={font.mono}
        fontSize={14}
        letterSpacing="0.18em"
        textTransform="uppercase"
        fill={palette.mint}
        fontWeight={600}
      >
        MEMORIA OPERATIVA
      </text>
      <text x={cardLeft + 28} y={cy - 30} fontFamily={font.display} fontSize={26} fontWeight={500} fill={palette.bf}>
        Decisiones pasadas, resultados, patrones.
      </text>
      <text x={cardLeft + 28} y={cy + 8} fontFamily={font.body} fontSize={18} fill={palette.textSoft}>
        Senia recuerda qué playbook funcionó la última vez
      </text>
      <text x={cardLeft + 28} y={cy + 34} fontFamily={font.body} fontSize={18} fill={palette.textSoft}>
        en una situación parecida — y por qué.
      </text>

      {/* Inbound flow from "Acción" — arrow stops at arrowGap before card. */}
      <text
        x={120}
        y={cy - 22}
        fontFamily={font.mono}
        fontSize={15}
        letterSpacing="0.16em"
        textTransform="uppercase"
        fill={palette.textMuted}
      >
        RESULTADO DE LA ACCIÓN
      </text>
      <line
        x1={120}
        y1={cy + 6}
        x2={inboundEndX - arrowHead}
        y2={cy + 6}
        stroke={palette.teal}
        strokeWidth={2}
        strokeDasharray="6 8"
      />
      <polygon
        points={`${inboundEndX},${cy + 6} ${inboundEndX - arrowHead},${cy + 6 - 8} ${inboundEndX - arrowHead},${cy + 6 + 8}`}
        fill={palette.teal}
      />

      {/* Outbound flow — arrow starts at arrowGap after card. */}
      <line
        x1={outboundStartX + arrowHead}
        y1={cy + 6}
        x2={W - 120}
        y2={cy + 6}
        stroke={palette.mint}
        strokeWidth={2.5}
      />
      <polygon
        points={`${W - 120},${cy + 6} ${W - 120 - arrowHead},${cy + 6 - 8} ${W - 120 - arrowHead},${cy + 6 + 8}`}
        fill={palette.mint}
      />
      <text
        x={W - 120}
        y={cy - 22}
        textAnchor="end"
        fontFamily={font.mono}
        fontSize={15}
        letterSpacing="0.16em"
        textTransform="uppercase"
        fill={palette.bf}
        fontWeight={600}
      >
        SIGUIENTE DIAGNÓSTICO
      </text>
      <text x={W - 120} y={cy + 36} textAnchor="end" fontFamily={font.body} fontSize={17} fill={palette.textSoft}>
        más rápido y mejor contextualizado
      </text>
    </svg>
  );
};

const Eslabon4Memory: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Eyebrow>09 · Eslabón 04 desbloqueado</Eyebrow>
      <Eyebrow color={palette.teal}>Acción → Aprendizaje</Eyebrow>
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      El flywheel deja de ser un ciclo y empieza a aprender.
    </h2>

    <p
      style={{
        marginTop: 24,
        fontSize: 24,
        lineHeight: 1.5,
        color: palette.textSoft,
        maxWidth: 1400,
      }}
    >
      Cada acción ejecutada genera datos nuevos que vuelven al sistema. Senia
      los incorpora a su memoria operativa — decisiones pasadas, resultados,
      patrones — y los usa para diagnosticar mejor la próxima vuelta.
    </p>

    <div style={{ marginTop: 40 }}>
      <MemoryDiagram />
    </div>

    <Footer pageNumber={9} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — Arquitectura: 4 pilares
// ═════════════════════════════════════════════════════════════════════════════

const PillarCard = ({
  num,
  icon,
  title,
  body,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div
    style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 10,
      padding: '36px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          background: 'rgba(124,240,168,0.22)',
          color: palette.bf,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: font.mono,
          fontSize: 14,
          letterSpacing: '0.18em',
          color: palette.textMuted,
        }}
      >
        {num}
      </div>
    </div>
    <div
      style={{
        fontFamily: font.display,
        fontSize: 32,
        fontWeight: 400,
        lineHeight: 1.15,
        letterSpacing: '-0.018em',
        color: palette.bf,
      }}
    >
      {title}
    </div>
    <div style={{ fontSize: 20, lineHeight: 1.5, color: palette.textSoft }}>{body}</div>
  </div>
);

const IconAgent = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5 19c1.6-3 4.2-4.5 7-4.5s5.4 1.5 7 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 2v2M5 5l1.4 1.4M19 5l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconSkills = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" fill="rgba(124,240,168,0.45)" />
  </svg>
);
const IconMcp = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    <path d="M7.4 7.4l3 3M16.6 7.4l-3 3M7.4 16.6l3-3M16.6 16.6l-3-3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const IconRouter = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h7l3 5-3 5H4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M14 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const LoopIcon = ({ size = 16, stroke = 1.8, color }: { size?: number; stroke?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M5 12a7 7 0 0 1 12-4.9M19 12a7 7 0 0 1-12 4.9"
      stroke={color ?? 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M17 4v3.2h-3.2"
      stroke={color ?? 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M7 20v-3.2h3.2"
      stroke={color ?? 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const CirclePlusIcon = ({ size = 16, stroke = 1.8, color }: { size?: number; stroke?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color ?? 'currentColor'}
      strokeWidth={stroke}
      fill="none"
    />
    <path
      d="M12 7.5v9M7.5 12h9"
      stroke={color ?? 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Architecture: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '90px 120px',
    }}
  >
    <Styles />
    <Eyebrow>10 · Arquitectura</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      Cuatro pilares sobre los que gira el flywheel.
    </h2>

    <div
      style={{
        marginTop: 44,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 24,
      }}
    >
      <PillarCard
        num="01"
        icon={<IconAgent />}
        title="Agente, no chatbot envuelto."
        body="Planifica varios pasos por adelantado, elige herramientas, ejecuta y evalúa el resultado en un solo flujo."
      />
      <PillarCard
        num="02"
        icon={<IconSkills />}
        title="Comportamiento modular en skills."
        body="Cada capacidad — diagnosticar, redactar, coordinar — vive como una skill versionable y auditable."
      />
      <PillarCard
        num="03"
        icon={<IconMcp />}
        title="Acceso al mundo vía MCP."
        body="Conectores estándar y auditables a tu CRM, ERP, email, calendario y mensajería. Granulares por permiso."
      />
      <PillarCard
        num="04"
        icon={<IconRouter />}
        title="Routing multi-modelo inteligente."
        body="Modelos potentes para razonar; modelos eficientes para rutina. Coste y latencia bajo control."
      />
    </div>

    <Footer pageNumber={10} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — Efecto compuesto: Mes 1 / Mes 6 / Año 1
// ═════════════════════════════════════════════════════════════════════════════

const TimelineStop = ({
  label,
  title,
  body,
  intensity,
}: {
  label: string;
  title: string;
  body: string;
  intensity: 'low' | 'mid' | 'high';
}) => {
  const bg =
    intensity === 'high'
      ? palette.bf
      : intensity === 'mid'
      ? 'rgba(124,240,168,0.28)'
      : palette.surface;
  const color = intensity === 'high' ? palette.textOnDark : palette.bf;
  const soft = intensity === 'high' ? palette.textSoftDark : palette.textSoft;
  const accent = intensity === 'high' ? palette.mint : palette.teal;
  return (
    <div
      style={{
        background: bg,
        color,
        border:
          intensity === 'low'
            ? `1px solid ${palette.border}`
            : intensity === 'mid'
            ? '1px solid rgba(124,240,168,0.5)'
            : `1px solid ${palette.bf}`,
        borderRadius: 10,
        padding: '40px 40px 44px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <Eyebrow color={accent} style={{ fontSize: 18 }}>
        {label}
      </Eyebrow>
      <div
        style={{
          fontFamily: font.display,
          fontSize: 40,
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 21, lineHeight: 1.5, color: soft }}>{body}</div>
    </div>
  );
};

const CompoundEffect: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <Eyebrow>11 · Efecto compuesto</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      Cada vuelta del flywheel es más rápida que la anterior.
    </h2>

    {/* Timeline rail */}
    <div style={{ position: 'relative', marginTop: 56 }}>
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          top: 18,
          height: 2,
          background:
            'linear-gradient(90deg, rgba(10,42,28,0.16), rgba(124,240,168,0.55) 50%, ' +
            palette.bf +
            ')',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
        {[
          { l: 'Mes 1', acc: 'rgba(10,42,28,0.5)' },
          { l: 'Mes 6', acc: palette.teal },
          { l: 'Año 1', acc: palette.bf },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: s.acc,
                display: 'inline-block',
                marginLeft: 6,
              }}
            />
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 16,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: palette.textMuted,
              }}
            >
              {s.l}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div
      style={{
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 28,
      }}
    >
      <TimelineStop
        label="Mes 1"
        title="Te ahorra horas."
        body="Diagnostica y conecta lo que antes hacíais a mano. La operativa diaria deja de quemar tiempo de análisis."
        intensity="low"
      />
      <TimelineStop
        label="Mes 6"
        title="Anticipa lo que antes detectabais tarde."
        body="Ha aprendido vuestros patrones operativos. Los problemas aparecen antes de que escalen."
        intensity="mid"
      />
      <TimelineStop
        label="Año 1"
        title="Opera en piloto automático lo repetitivo."
        body="El equipo se concentra en lo que necesita criterio humano. El resto gira solo."
        intensity="high"
      />
    </div>

    <Footer pageNumber={11} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — Comparativa: cadena rota vs flywheel
// ═════════════════════════════════════════════════════════════════════════════

const BrokenChain = () => {
  const W = 720;
  const H = 520;
  const steps = ['Datos', 'Diagnóstico', 'Decisión', 'Acción'];
  // Vertical chain on the left.
  const stepH = 96;
  const gap = 28;
  const startY = 24;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {steps.map((s, i) => {
        const y = startY + i * (stepH + gap);
        const next = startY + (i + 1) * (stepH + gap);
        return (
          <g key={i}>
            <rect
              x={120}
              y={y}
              width={W - 240}
              height={stepH}
              rx={10}
              fill={palette.surface}
              stroke={palette.border}
            />
            <text
              x={W / 2}
              y={y + stepH / 2 + 8}
              textAnchor="middle"
              fontFamily={font.display}
              fontSize={26}
              fontWeight={500}
              fill={palette.bf}
            >
              {s}
            </text>
            {/* break marker between step i and i+1 */}
            {i < steps.length - 1 && (
              <g>
                <line
                  x1={W / 2}
                  y1={y + stepH + 4}
                  x2={W / 2}
                  y2={next - 4}
                  stroke={palette.warn}
                  strokeWidth={2.5}
                  strokeDasharray="4 8"
                />
                <g transform={`translate(${W / 2}, ${(y + stepH + next) / 2})`}>
                  <circle r={11} fill="rgba(232,154,106,0.18)" stroke={palette.warn} strokeWidth={1.5} />
                  <text
                    textAnchor="middle"
                    y={4}
                    fontFamily={font.mono}
                    fontSize={11}
                    fontWeight={700}
                    fill={palette.warn}
                  >
                    !
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })}
      {/* Drop-off after last step */}
      <text
        x={W / 2}
        y={H - 6}
        textAnchor="middle"
        fontFamily={font.mono}
        fontSize={13}
        letterSpacing="0.16em"
        textTransform="uppercase"
        fill={palette.warn}
        fontWeight={600}
      >
        APRENDIZAJE = 0
      </text>
    </svg>
  );
};

const ComparisonSlide: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '90px 120px',
    }}
  >
    <Styles />
    <Eyebrow>12 · Lo que ves vs lo que tienes</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      Cadena rota vs flywheel que aprende.
    </h2>

    <div
      style={{
        marginTop: 32,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 10,
          padding: '36px 40px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <Eyebrow color={palette.warn}>BI tradicional</Eyebrow>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.018em',
          }}
        >
          Cadena lineal rota en 4 puntos.
        </div>
        <div style={{ marginTop: 4 }}>
          <BrokenChain />
        </div>
      </div>

      <div
        style={{
          background: palette.bf,
          color: palette.textOnDark,
          borderRadius: 10,
          padding: '36px 64px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <Eyebrow color={palette.mint}>Senia</Eyebrow>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.018em',
          }}
        >
          Flywheel cerrado y continuo que aprende.
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Flywheel size={410} state={['on', 'on', 'on', 'on']} dark />
        </div>
      </div>
    </div>

    <Footer pageNumber={12} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — Integración completa
// ═════════════════════════════════════════════════════════════════════════════

const IntegrationUnlock: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.off,
      color: palette.bf,
      padding: '100px 120px',
    }}
  >
    <Styles />
    <Eyebrow>13 · Integración completa</Eyebrow>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 64,
        fontWeight: 300,
        lineHeight: 1.04,
        letterSpacing: '-0.024em',
        margin: '20px 0 0',
        maxWidth: 1500,
      }}
    >
      La integración no es un coste. Es velocidad desbloqueada.
    </h2>

    <p
      style={{
        marginTop: 24,
        fontSize: 26,
        lineHeight: 1.55,
        color: palette.textSoft,
        maxWidth: 1500,
      }}
    >
      Cuanto más conectes Senia con tu SaaS y tus plataformas operativas, más
      herramientas MCP tiene a su disposición, más skills relevantes se activan,
      y más rápido gira el flywheel entero.
    </p>

    <div
      style={{
        marginTop: 48,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
      }}
    >
      {[
        { k: '+ MCP tools', v: 'Más plataformas conectadas, más eslabones que Senia puede ejecutar.', val: '+' as const },
        { k: '+ Skills activas', v: 'Más casos de uso que Senia reconoce y resuelve sin intervención manual.', val: 'circlePlus' as const },
        { k: '+ Vueltas/día', v: 'Más decisiones por unidad de tiempo. El flywheel gira más rápido.', val: 'loop' as const },
      ].map((it, i) => (
        <div
          key={i}
          style={{
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: 10,
            padding: '36px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(124,240,168,0.32)',
              lineHeight: 1,
              fontFamily: font.display,
              fontSize: 110,
              fontWeight: 200,
              letterSpacing: '-0.04em',
            }}
          >
            {it.val === 'loop' ? (
              <LoopIcon size={92} stroke={2.2} color="rgba(124,240,168,0.45)" />
            ) : it.val === 'circlePlus' ? (
              <CirclePlusIcon size={92} stroke={2.2} color="rgba(124,240,168,0.45)" />
            ) : (
              it.val
            )}
          </div>
          <Eyebrow color={palette.mint}>{it.k}</Eyebrow>
          <div style={{ fontSize: 22, lineHeight: 1.5, color: palette.textSoft }}>{it.v}</div>
        </div>
      ))}
    </div>

    <div
      style={{
        marginTop: 48,
        fontFamily: font.mono,
        fontSize: 22,
        color: palette.bf,
        letterSpacing: '-0.005em',
        maxWidth: 1500,
      }}
    >
      <span style={{ color: palette.teal }}>Triari =</span>{' '}
      capa estratégica + capa de software + Senia. No vendemos una herramienta,
      vendemos un sistema operativo de decisión.
    </div>

    <Footer pageNumber={13} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — Cierre
// ═════════════════════════════════════════════════════════════════════════════

const Closing: Page = () => (
  <div
    style={{
      ...fill,
      background: palette.bf,
      color: palette.textOnDark,
      padding: '120px 140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Styles />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Eyebrow color={palette.mint}>14 · Cierre</Eyebrow>
      <Eyebrow color={palette.textMutedDark}>Triari · Senia</Eyebrow>
    </div>

    <div>
      <div
        style={{
          fontFamily: font.mono,
          fontSize: 20,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: palette.mint,
          marginBottom: 36,
        }}
      >
        El sistema operativo de decisión
      </div>
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 124,
          fontWeight: 300,
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          margin: 0,
        }}
      >
        <span style={{ color: palette.mint }}>Senia</span> entiende.{' '}
        <span style={{ color: palette.mint }}>Senia</span> decide.
        <br />
        <span style={{ color: palette.mint }}>Senia</span> actúa.{' '}
        <span style={{ color: palette.mint }}>Senia</span> aprende.
      </h1>
      <p
        style={{
          marginTop: 48,
          maxWidth: 1300,
          fontSize: 32,
          lineHeight: 1.4,
          color: palette.textSoftDark,
          fontWeight: 300,
        }}
      >
        Y cada vuelta de vuestro negocio es más rápida que la anterior.
      </p>
    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: font.mono,
        fontSize: 18,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: palette.textMutedDark,
      }}
    >
      <span>triari.partners</span>
      <span style={{ color: palette.mint, display: 'inline-flex', alignItems: 'center' }}>
        <LoopIcon size={22} stroke={1.8} />
      </span>
    </div>
  </div>
);

// ─── Slide export ────────────────────────────────────────────────────────────
export const meta: SlideMeta = {
  title: 'Senia vs BI tradicional',
};

export default [
  Cover,
  FlywheelHero,
  FlywheelBroken1,
  FlywheelBroken2,
  AgentVsChatbot,
  Eslabon1,
  Eslabon2,
  Eslabon3MCP,
  Eslabon4Memory,
  Architecture,
  CompoundEffect,
  ComparisonSlide,
  IntegrationUnlock,
  Closing,
] satisfies Page[];
