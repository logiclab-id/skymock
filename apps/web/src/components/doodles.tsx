export function SmLogo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="2.2"
      />
      <path
        d="M11 44.5 Q 32 38.5, 53 42.5"
        stroke="var(--marker-warm)"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M25.5 22.2 C 23.2 18.6, 16.4 18.4, 14.1 22.3 C 12.1 25.7, 16.3 28.7, 20.5 30.7 C 25.3 33.0, 26.7 38.3, 22.3 41.5 C 18.3 44.4, 12.7 43.1, 10.7 39.7"
        stroke="var(--ink)"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.8 42.2 C 31.2 34.4, 33.0 25.8, 35.2 20.2 C 36.2 25.6, 38.0 31.8, 40.0 35.8 C 42.6 30.2, 45.8 23.4, 48.6 18.8 C 49.4 26.2, 49.8 34.6, 51.8 42.0"
        stroke="var(--ink)"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 50.5 Q 32 46.8, 51.5 49.2"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M53 8.5 L 54.1 11.4 L 57 12.5 L 54.1 13.6 L 53 16.5 L 51.9 13.6 L 49 12.5 L 51.9 11.4 Z"
        fill="var(--accent)"
      />
    </svg>
  );
}

export function MarkerSwoosh({
  color = "var(--marker-warm)",
}: {
  color?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 20"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: "-4px",
        right: "-4px",
        bottom: "1px",
        height: "10px",
        width: "calc(100% + 8px)",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <path
        d="M4 13 Q 48 6, 94 11 T 136 10"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SketchUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M3 8.5C28 3.5 62 3 117 7.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SubtleHandwrittenAccents() {
  return (
    <div
      className="doodle-corners"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Bottom-left tall lively hand-drawn API Mock flow */}
      <svg
        width="230"
        height="265"
        viewBox="0 0 230 265"
        fill="none"
        style={{
          position: "fixed",
          bottom: "0.75rem",
          left: "1.1rem",
          color: "var(--ink-muted)",
          opacity: 0.72,
        }}
      >
        {/* Top sketchy pill: GET /m/mock */}
        <path
          d="M 18 24 Q 58 18, 118 22 Q 124 34, 118 46 Q 68 50, 18 45 Q 13 34, 18 24 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text
          x="27"
          y="38"
          fill="var(--accent)"
          fontSize="11.5"
          fontWeight="600"
          fontFamily="var(--font-mono)"
        >
          GET{" "}
          <tspan fill="currentColor" fontWeight="400">
            /m/mock
          </tspan>
        </text>

        {/* Curved dashed arrow down-right */}
        <path
          d="M 68 50 C 66 72, 92 78, 102 96"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <path
          d="M 95 92 L 103 98 L 105 89"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Little crown above MOCK */}
        <path
          d="M 148 92 L 146 80 L 154 86 L 160 76 L 166 86 L 174 80 L 172 92 Z"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Center hero hand-drawn "MOCK API" box with marker highlight */}
        <path
          d="M 54 128 Q 108 122, 166 127"
          stroke="var(--marker-warm)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <text
          x="56"
          y="131"
          fill="var(--ink)"
          fontSize="26"
          fontWeight="700"
          fontFamily="var(--font-hand)"
          transform="rotate(-3 56 131)"
        >
          MOCK API!
        </text>

        {/* Sparkles around MOCK API */}
        <path
          d="M 32 106 L 34 112 L 40 114 L 34 116 L 32 122 L 30 116 L 24 114 L 30 112 Z"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="186" cy="112" r="2.2" fill="var(--accent)" />

        {/* Curved arrow down-left to JSON response card */}
        <path
          d="M 96 142 C 92 162, 72 166, 68 184"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <path
          d="M 63 178 L 67 186 L 74 180"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mini sketchy JSON response card */}
        <path
          d="M 22 192 Q 80 189, 146 193 Q 150 212, 146 226 Q 82 229, 22 225 Q 18 208, 22 192 Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="32"
          y="213"
          fill="currentColor"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          {"{ "}
          <tspan fill="var(--accent)">"mock"</tspan>
          {": true }"}
        </text>
        <text
          x="156"
          y="214"
          fill="var(--accent)"
          fontSize="16"
          fontWeight="700"
          fontFamily="var(--font-hand)"
          transform="rotate(-4 156 214)"
        >
          200 OK
        </text>

        {/* Bottom handwritten tagline */}
        <text
          x="20"
          y="252"
          fill="currentColor"
          fontSize="18"
          fontFamily="var(--font-hand)"
          transform="rotate(-2 20 252)"
        >
          fake it till backend ships →
        </text>
        <path
          d="M 22 258 Q 108 253, 198 257"
          stroke="var(--marker-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-right tall lively hand-drawn Chaos & Latency sketch */}
      <svg
        width="210"
        height="240"
        viewBox="0 0 210 240"
        fill="none"
        style={{
          position: "fixed",
          bottom: "0.75rem",
          right: "1rem",
          color: "var(--ink-muted)",
          opacity: 0.7,
        }}
      >
        {/* Top handwritten note */}
        <text
          x="64"
          y="36"
          fill="currentColor"
          fontSize="19"
          fontFamily="var(--font-hand)"
          transform="rotate(4 64 36)"
        >
          simulate chaos!
        </text>

        {/* Curved arrow down */}
        <path
          d="M 124 44 C 132 62, 118 70, 112 84"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <path
          d="M 108 77 L 111 86 L 118 81"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tilted sketchy status stamps: 429 & 500 */}
        <g transform="rotate(-7 88 106)">
          <rect
            x="60"
            y="92"
            width="54"
            height="24"
            rx="6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x="73"
            y="108"
            fill="var(--accent)"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            429
          </text>
        </g>

        <g transform="rotate(6 154 118)">
          <rect
            x="128"
            y="104"
            width="54"
            height="24"
            rx="6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x="142"
            y="120"
            fill="currentColor"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            500
          </text>
        </g>

        {/* Sketchy stopwatch + delay text */}
        <circle
          cx="94"
          cy="162"
          r="15"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M 88 143 H 100 M 94 143 V 147 M 94 162 V 154 M 94 162 L 101 166"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <text
          x="118"
          y="168"
          fill="var(--ink)"
          fontSize="21"
          fontWeight="700"
          fontFamily="var(--font-hand)"
          transform="rotate(-3 118 168)"
        >
          +250ms
        </text>

        {/* Sparkle */}
        <path
          d="M 52 152 L 54 158 L 60 160 L 54 162 L 52 168 L 50 162 L 44 160 L 50 158 Z"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Bottom handwritten tagline */}
        <text
          x="36"
          y="214"
          fill="currentColor"
          fontSize="19"
          fontFamily="var(--font-hand)"
          transform="rotate(2 36 214)"
        >
          no backend? no problem!
        </text>
        <path
          d="M 42 222 Q 116 217, 192 222"
          stroke="var(--marker-warm)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function HandwrittenToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.35rem",
        left: "50%",
        transform: "translateX(-50%) rotate(-1deg)",
        zIndex: 60,
        padding: "0.35rem 1.05rem",
        borderRadius: "255px 14px 225px 14px / 14px 225px 14px 255px",
        background: "var(--surface)",
        border: "1.5px solid var(--border-strong)",
        color: "var(--ink)",
        fontFamily: "var(--font-hand)",
        fontSize: "1.22rem",
        fontWeight: 700,
        boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.45)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        pointerEvents: "none",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
