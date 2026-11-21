import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface DocsViewProps {
  projectSlug: string;
  isProtected: boolean;
}

const FEATURE_GUIDE = [
  {
    name: "{{$uuid}}",
    desc: "Generates a fresh random UUID v4 on every incoming mock request.",
  },
  {
    name: "{{$isoTimestamp}}",
    desc: "Injects the current ISO-8601 UTC timestamp dynamically into JSON.",
  },
  {
    name: "{{$params.id}}",
    desc: "Echoes dynamic path parameters from routes like /v1/users/:id.",
  },
  {
    name: "{{$body.field}}",
    desc: "Echoes values from incoming POST/PUT/PATCH JSON request bodies.",
  },
  {
    name: "{{$header.name}}",
    desc: "Reads any incoming request header and injects it into the response.",
  },
  {
    name: "Project Headers",
    desc: "Shared per-project default headers inherited by all routes, with per-endpoint override.",
  },
  {
    name: "Auth & Cookies",
    desc: "Configure Bearer, API Key, or Basic Auth guards and Set-Cookie flags per endpoint.",
  },
  {
    name: "Wildcard CORS (*)",
    desc: "All /m/{slug}/* mock routes allow cross-origin calls from localhost, emulators, and mobile devices.",
  },
] as const;

export function DocsView({ projectSlug, isProtected }: DocsViewProps) {
  const [copiedCurl, setCopiedCurl] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://api.skymock.dev";

  const curlExample = isProtected
    ? `curl -X GET "${origin}/m/${projectSlug}/v1/users/42" \\\n  -H "x-skymock-key: <your-project-key>" \\\n  -H "Authorization: Bearer demo"`
    : `curl -X GET "${origin}/m/${projectSlug}/v1/users/42" \\\n  -H "Authorization: Bearer demo"`;

  const handleCopyCurl = () => {
    navigator.clipboard?.writeText(curlExample).catch(() => {});
    setCopiedCurl(true);
    window.setTimeout(() => setCopiedCurl(false), 1200);
  };

  return (
    <div className="tab-panel-animate max-w-[880px] mx-auto">
      <div
        className="clean-card docs-pad"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          fontSize: "0.88rem",
          lineHeight: 1.6,
        }}
      >
        <div>
          <h2
            style={{
              display: "inline-block",
              fontFamily: "var(--font-hand)",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--ink)",
              lineHeight: 1.05,
            }}
          >
            How Skymock Works
          </h2>
          <p
            style={{
              color: "var(--ink-muted)",
              marginTop: "0.35rem",
              fontSize: "0.84rem",
            }}
          >
            Instant multi-project API mock server with dynamic JSON templates,
            latency &amp; error simulation, and live request logs.
          </p>
        </div>

        {/* Annotated Handwritten SVG Diagram (Skytype style) */}
        <div className="docs-diagram-wrap">
          <svg
            viewBox="0 0 760 325"
            fill="none"
            className="docs-diagram-svg"
            aria-label="Annotated handwritten guide of Skymock UI"
          >
            {/* Left Sidebar Wireframe */}
            <rect
              x="128"
              y="46"
              width="132"
              height="214"
              rx="8"
              fill="#181818"
              stroke="#2c2c2c"
              strokeWidth="1.4"
            />
            <rect x="128" y="46" width="132" height="28" rx="8" fill="#141414" />
            <line
              x1="128"
              y1="74"
              x2="260"
              y2="74"
              stroke="#262626"
              strokeWidth="1"
            />
            <text
              x="138"
              y="64"
              fill="#ededed"
              fontSize="10"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              acme-mobile
            </text>
            <text
              x="244"
              y="64"
              fill="#8a8a8a"
              fontSize="11"
              fontFamily="monospace"
            >
              +
            </text>

            {/* Sidebar Routes */}
            <text
              x="136"
              y="94"
              fill="#38bdf8"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="monospace"
            >
              GET{" "}
              <tspan fill="#8a8a8a" fontWeight="400">
                /v1/users/:id
              </tspan>
            </text>
            <rect
              x="132"
              y="104"
              width="124"
              height="24"
              rx="4"
              fill="#222222"
            />
            <text
              x="136"
              y="119"
              fill="#4ade80"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="monospace"
            >
              POST{" "}
              <tspan fill="#ededed" fontWeight="400">
                /v1/auth/login
              </tspan>
            </text>
            <text
              x="136"
              y="144"
              fill="#f87171"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="monospace"
            >
              DEL{" "}
              <tspan fill="#8a8a8a" fontWeight="400">
                /v1/sessions/:id
              </tspan>
            </text>
            <line
              x1="128"
              y1="234"
              x2="260"
              y2="234"
              stroke="#262626"
              strokeWidth="1"
            />
            <text
              x="138"
              y="250"
              fill="#8a8a8a"
              fontSize="9"
              fontFamily="sans-serif"
            >
              Access
            </text>
            <text
              x="218"
              y="250"
              fill="#ededed"
              fontSize="9"
              fontFamily="monospace"
            >
              Public
            </text>

            {/* Right Editor Card Wireframe */}
            <rect
              x="270"
              y="46"
              width="362"
              height="214"
              rx="8"
              fill="#181818"
              stroke="#2c2c2c"
              strokeWidth="1.4"
            />
            <rect x="270" y="46" width="362" height="32" rx="8" fill="#141414" />
            <line
              x1="270"
              y1="78"
              x2="632"
              y2="78"
              stroke="#262626"
              strokeWidth="1"
            />

            {/* Top Bar Controls */}
            <rect
              x="280"
              y="53"
              width="44"
              height="18"
              rx="4"
              fill="#181818"
              stroke="#303030"
            />
            <text
              x="288"
              y="65"
              fill="#4ade80"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="monospace"
            >
              POST
            </text>
            <rect
              x="330"
              y="53"
              width="178"
              height="18"
              rx="4"
              fill="#181818"
              stroke="#303030"
            />
            <text
              x="338"
              y="65"
              fill="#ededed"
              fontSize="9.5"
              fontFamily="monospace"
            >
              /v1/auth/login
            </text>
            <rect
              x="514"
              y="53"
              width="42"
              height="18"
              rx="4"
              fill="#181818"
              stroke="#303030"
            />
            <text
              x="523"
              y="65"
              fill="#ededed"
              fontSize="9.5"
              fontFamily="monospace"
            >
              201
            </text>
            <rect
              x="562"
              y="53"
              width="58"
              height="18"
              rx="4"
              fill="#181818"
              stroke="#303030"
            />
            <text
              x="571"
              y="65"
              fill="#8a8a8a"
              fontSize="9.5"
              fontFamily="monospace"
            >
              150 ms
            </text>

            {/* Postman Sub-tabs */}
            <line
              x1="270"
              y1="100"
              x2="632"
              y2="100"
              stroke="#262626"
              strokeWidth="1"
            />
            <text
              x="282"
              y="93"
              fill="#ededed"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              Body
            </text>
            <rect x="280" y="98" width="26" height="2" rx="1" fill="#facc15" />
            <text
              x="320"
              y="93"
              fill="#8a8a8a"
              fontSize="9.5"
              fontFamily="sans-serif"
            >
              Params   Auth   Headers   Cookies
            </text>

            {/* Syntax-Highlighted JSON Code */}
            <text
              x="284"
              y="120"
              fill="#8a8a8a"
              fontSize="10.5"
              fontFamily="monospace"
            >
              1 {"{"}
            </text>
            <text
              x="284"
              y="138"
              fill="#8a8a8a"
              fontSize="10.5"
              fontFamily="monospace"
            >
              2   <tspan fill="#82aaff">"token"</tspan>:{" "}
              <tspan fill="#9ec58a">"sky_</tspan>
              <tspan fill="#38bdf8">{"{{$uuid}}"}</tspan>
              <tspan fill="#9ec58a">"</tspan>,
            </text>
            <text
              x="284"
              y="156"
              fill="#8a8a8a"
              fontSize="10.5"
              fontFamily="monospace"
            >
              3   <tspan fill="#82aaff">"email"</tspan>:{" "}
              <tspan fill="#9ec58a">"</tspan>
              <tspan fill="#38bdf8">{"{{$body.email}}"}</tspan>
              <tspan fill="#9ec58a">"</tspan>,
            </text>
            <text
              x="284"
              y="174"
              fill="#8a8a8a"
              fontSize="10.5"
              fontFamily="monospace"
            >
              4   <tspan fill="#82aaff">"ok"</tspan>:{" "}
              <tspan fill="#b49be8">true</tspan>,{" "}
              <tspan fill="#82aaff">"ms"</tspan>:{" "}
              <tspan fill="#d9b27c">150</tspan>
            </text>
            <text
              x="284"
              y="192"
              fill="#8a8a8a"
              fontSize="10.5"
              fontFamily="monospace"
            >
              5 {"}"}
            </text>

            {/* Footer */}
            <line
              x1="270"
              y1="228"
              x2="632"
              y2="228"
              stroke="#262626"
              strokeWidth="1"
            />
            <text
              x="282"
              y="247"
              fill="#8a8a8a"
              fontSize="9.5"
              fontFamily="monospace"
            >
              /m/acme-mobile/v1/auth/login ❐
            </text>
            <rect
              x="530"
              y="235"
              width="44"
              height="18"
              rx="4"
              fill="#181818"
              stroke="#303030"
            />
            <text
              x="537"
              y="247"
              fill="#8a8a8a"
              fontSize="9"
              fontFamily="sans-serif"
            >
              Format
            </text>
            <rect
              x="580"
              y="235"
              width="42"
              height="18"
              rx="4"
              fill="#181818"
              stroke="#303030"
            />
            <text
              x="590"
              y="247"
              fill="#ededed"
              fontSize="9"
              fontFamily="sans-serif"
            >
              ▶ Test
            </text>

            {/* Handwritten Callout 1: Top-left */}
            <text
              x="8"
              y="28"
              fill="#d9b27c"
              fontSize="18"
              fontFamily="Caveat, cursive"
              transform="rotate(-4 8 28)"
            >
              1. Routes per project
            </text>
            <path
              d="M 106 32 Q 134 26, 152 46"
              stroke="#d9b27c"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d="M 145 45 L 153 47 L 151 39"
              stroke="#d9b27c"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Handwritten Callout 2: Top-right */}
            <text
              x="555"
              y="26"
              fill="#facc15"
              fontSize="18"
              fontFamily="Caveat, cursive"
              transform="rotate(2 555 26)"
            >
              2. Status &amp; delay (ms)!
            </text>
            <path
              d="M 594 31 Q 584 40, 578 50"
              stroke="#facc15"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d="M 575 43 L 577 51 L 584 47"
              stroke="#facc15"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Handwritten Callout 3: Mid-right */}
            <text
              x="644"
              y="140"
              fill="#9ec58a"
              fontSize="18"
              fontFamily="Caveat, cursive"
              transform="rotate(3 644 140)"
            >
              dynamic vars
            </text>
            <text
              x="650"
              y="160"
              fill="#9ec58a"
              fontSize="16"
              fontFamily="Caveat, cursive"
              transform="rotate(3 650 160)"
            >
              {"{{$uuid}}!"}
            </text>
            <path
              d="M 640 148 Q 612 148, 594 156"
              stroke="#9ec58a"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d="M 600 150 L 593 157 L 602 159"
              stroke="#9ec58a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Handwritten Callout 4: Bottom-left */}
            <text
              x="160"
              y="298"
              fill="#82aaff"
              fontSize="18"
              fontFamily="Caveat, cursive"
              transform="rotate(-2 160 298)"
            >
              3. Click to copy live URL!
            </text>
            <path
              d="M 294 282 Q 312 272, 326 256"
              stroke="#82aaff"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d="M 319 258 L 327 255 L 326 263"
              stroke="#82aaff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Handwritten Callout 5: Bottom-right */}
            <text
              x="548"
              y="298"
              fill="#b49be8"
              fontSize="18"
              fontFamily="Caveat, cursive"
              transform="rotate(2 548 298)"
            >
              test &amp; inspect logs
            </text>
            <path
              d="M 606 280 Q 608 268, 603 256"
              stroke="#b49be8"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d="M 599 262 L 602 255 L 608 260"
              stroke="#b49be8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* How to Use */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "1.45rem",
              color: "var(--ink)",
              marginBottom: "0.4rem",
            }}
          >
            How to Use
          </h3>
          <ol
            style={{
              paddingLeft: "1.2rem",
              color: "var(--ink-muted)",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <li>
              <strong style={{ color: "var(--ink)" }}>
                Create or Pick a Project:
              </strong>{" "}
              Use the top-right switcher to isolate endpoints, headers, and logs
              under a unique Base URL{" "}
              <code style={{ color: "var(--accent)" }}>/m/{projectSlug}</code>.
            </li>
            <li>
              <strong style={{ color: "var(--ink)" }}>
                Configure Your Mock:
              </strong>{" "}
              Set HTTP method, dynamic path (e.g.{" "}
              <code style={{ color: "var(--accent)" }}>/v1/users/:id</code>),
              status code, artificial delay, plus{" "}
              <strong style={{ color: "var(--ink)" }}>
                Params, Auth, Headers, Cookies
              </strong>{" "}
              and JSON body.
            </li>
            <li>
              <strong style={{ color: "var(--ink)" }}>
                Call &amp; Inspect Live:
              </strong>{" "}
              Click the URL in the editor footer to copy it, call it from your
              app, and inspect incoming traffic in{" "}
              <strong style={{ color: "var(--ink)" }}>Logs</strong>.
            </li>
          </ol>
        </div>

        {/* Example Request */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "1.45rem",
                color: "var(--ink)",
              }}
            >
              Example Request
            </h3>
            <button
              type="button"
              onClick={handleCopyCurl}
              className="clean-btn text-xs"
            >
              {copiedCurl ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre
            className="p-3.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface-sub)] text-xs text-[var(--ink)] overflow-x-auto m-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {curlExample}
          </pre>
        </div>

        {/* Template & Feature Guide (Skytype Button Guide style) */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "1.45rem",
              color: "var(--ink)",
              marginBottom: "0.55rem",
            }}
          >
            Variables &amp; Features
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
              gap: "0.6rem",
            }}
          >
            {FEATURE_GUIDE.map((item) => (
              <div
                key={item.name}
                style={{
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-sub)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--ink-muted)",
                    marginTop: "0.2rem",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
