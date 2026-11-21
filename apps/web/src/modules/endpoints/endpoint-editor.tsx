import { Button, Checkbox, Input } from "@cloudflare/kumo";
import { CleanSelect } from "@/components/clean-select";
import { highlightJson } from "@/core/json-highlighter";
import { useAutoHideScroll } from "@/hooks/use-auto-hide-scroll";
import type {
  AuthType,
  CookieItem,
  EndpointAuth,
  HttpMethod,
  KeyValueItem,
  MockEndpoint,
} from "@/types/mock";
import { Layers, Lock, Play, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type EditorSubTab = "body" | "params" | "auth" | "headers" | "cookies";

interface EndpointEditorProps {
  projectName: string;
  isProtected: boolean;
  projectAuth: EndpointAuth;
  projectEnvVars: KeyValueItem[];
  endpoints: MockEndpoint[];
  activeId: string;
  testing: boolean;
  lastTestLabel: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onChange: (updated: MockEndpoint) => void;
  onChangeProjectAuth: (auth: EndpointAuth) => void;
  onChangeProjectEnvVars: (envVars: KeyValueItem[]) => void;
  onTest: () => void;
  onToggleProtected: () => void;
}

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: "text-sky-500",
  POST: "text-emerald-500",
  PUT: "text-amber-500",
  PATCH: "text-violet-500",
  DELETE: "text-rose-500",
};

const METHOD_OPTIONS = (["GET", "POST", "PUT", "PATCH", "DELETE"] as const).map(
  (m) => ({
    value: m,
    label: m,
    className: `font-semibold ${METHOD_COLOR[m]}`,
  }),
);

const STATUS_OPTIONS = [
  "200",
  "201",
  "204",
  "400",
  "401",
  "403",
  "404",
  "422",
  "429",
  "500",
].map((code) => ({ value: code, label: code }));

const PROJECT_AUTH_OPTIONS: ReadonlyArray<{
  value: Exclude<AuthType, "inherit">;
  label: string;
}> = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "api_key", label: "API Key" },
  { value: "basic", label: "Basic Auth" },
];

const ENDPOINT_AUTH_OPTIONS: ReadonlyArray<{ value: AuthType; label: string }> =
  [
    { value: "inherit", label: "Inherit from Project" },
    { value: "none", label: "No Auth" },
    { value: "bearer", label: "Bearer Token" },
    { value: "api_key", label: "API Key" },
    { value: "basic", label: "Basic Auth" },
  ];

function resolveEnvValue(raw: string, envVars: KeyValueItem[]): string {
  if (!raw.includes("{{")) return raw;
  const map = new Map<string, string>();
  for (const item of envVars) {
    if (item.enabled && item.key.trim()) {
      map.set(item.key.trim(), item.value);
    }
  }
  return raw.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (full, key: string) =>
    map.has(key) ? (map.get(key) ?? "") : full,
  );
}

export function EndpointEditor({
  projectName,
  isProtected,
  projectAuth,
  projectEnvVars,
  endpoints,
  activeId,
  testing,
  lastTestLabel,
  onSelect,
  onAdd,
  onDelete,
  onChange,
  onChangeProjectAuth,
  onChangeProjectEnvVars,
  onTest,
  onToggleProtected,
}: EndpointEditorProps) {
  const active = endpoints.find((e) => e.id === activeId) ?? endpoints[0];
  const [subTab, setSubTab] = useState<EditorSubTab>("body");
  const [viewingEnv, setViewingEnv] = useState(false);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLPreElement | null>(null);
  const editorScroll = useAutoHideScroll(900);
  const listScroll = useAutoHideScroll(900);

  const highlightedJson = useMemo(
    () => highlightJson(active.responseBody),
    [active.responseBody],
  );

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, active.responseBody.split("\n").length);
    return Array.from({ length: count }, (_, idx) => idx + 1);
  }, [active.responseBody]);

  const jsonError = useMemo(() => {
    const trimmed = active.responseBody.trim();
    if (!trimmed) return null;
    try {
      JSON.parse(trimmed);
      return null;
    } catch {
      return "Invalid JSON";
    }
  }, [active.responseBody]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(active.responseBody);
      onChange({
        ...active,
        responseBody: JSON.stringify(parsed, null, 2),
      });
    } catch {
      // keep raw text when invalid JSON
    }
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const top = e.currentTarget.scrollTop;
    const left = e.currentTarget.scrollLeft;
    if (gutterRef.current) {
      gutterRef.current.scrollTop = top;
    }
    if (backdropRef.current) {
      backdropRef.current.scrollTop = top;
      backdropRef.current.scrollLeft = left;
    }
    editorScroll.onScroll();
  };

  const updateKeyValueList = (
    field: "params" | "headers",
    items: KeyValueItem[],
  ) => {
    onChange({ ...active, [field]: items });
  };

  const addKeyValueRow = (field: "params" | "headers") => {
    const next: KeyValueItem = {
      id: `${field}-${Date.now()}`,
      key: "",
      value: "",
      enabled: true,
    };
    updateKeyValueList(field, [...active[field], next]);
  };

  const updateCookieList = (items: CookieItem[]) => {
    onChange({ ...active, cookies: items });
  };

  const addCookieRow = () => {
    const next: CookieItem = {
      id: `ck-${Date.now()}`,
      name: "",
      value: "",
      httpOnly: true,
      secure: true,
      enabled: true,
    };
    updateCookieList([...active.cookies, next]);
  };

  const activeParamsCount = active.params.filter(
    (p) => p.enabled && p.key,
  ).length;
  const activeHeadersCount = active.headers.filter(
    (h) => h.enabled && h.key,
  ).length;
  const activeCookiesCount = active.cookies.filter(
    (c) => c.enabled && c.name,
  ).length;
  const activeEnvCount = projectEnvVars.filter(
    (v) => v.enabled && v.key,
  ).length;
  const effectiveAuth =
    active.auth.type === "inherit" ? projectAuth : active.auth;

  const subTabs: {
    id: EditorSubTab;
    label: string;
    count?: number;
    dot?: boolean;
  }[] = [
    { id: "body", label: "Body" },
    { id: "params", label: "Params", count: activeParamsCount },
    { id: "auth", label: "Auth", dot: effectiveAuth.type !== "none" },
    { id: "headers", label: "Headers", count: activeHeadersCount },
    { id: "cookies", label: "Cookies", count: activeCookiesCount },
  ];

  return (
    <div className="tab-panel-animate grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3.5 items-start">
      {/* LEFT SIDEBAR: Project Endpoints List */}
      <aside className="clean-card">
        <div className="px-3 py-2.5 bg-[var(--surface-sub)] border-b border-[var(--border)] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[var(--ink)] truncate">
              {projectName}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewingEnv((prev) => !prev)}
              title={`Project Env (${activeEnvCount})`}
              aria-label="Project Environment"
              aria-pressed={viewingEnv}
              className={`tb-icon ${
                viewingEnv
                  ? "text-[var(--accent)] bg-[var(--surface-hover)]"
                  : ""
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewingEnv(false);
                onAdd();
              }}
              title="New endpoint"
              aria-label="New endpoint"
              className="tb-icon"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          onScroll={listScroll.onScroll}
          className={`scroll-auto-hide max-h-[440px] overflow-y-auto divide-y divide-[var(--border)]${
            listScroll.isScrolling ? " is-scrolling" : ""
          }`}
        >
          {endpoints.map((ep) => {
            const isSelected = !viewingEnv && ep.id === active.id;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  setViewingEnv(false);
                  onSelect(ep.id);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2 text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[var(--surface-hover)] text-[var(--ink)]"
                    : "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--surface-sub)] hover:text-[var(--ink)]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span
                  className={`font-semibold w-11 shrink-0 text-[11px] ${METHOD_COLOR[ep.method]}`}
                >
                  {ep.method}
                </span>
                <span className="truncate flex-1">{ep.path}</span>
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2 bg-[var(--surface-sub)] border-t border-[var(--border)] flex items-center justify-between text-[11px]">
          <span className="text-[var(--ink-muted)]">Access</span>
          <button
            type="button"
            onClick={onToggleProtected}
            className="inline-flex items-center gap-1 text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
            title="Toggle Public / Protected (x-skymock-key)"
          >
            {isProtected && <Lock className="w-3 h-3" />}
            <span>{isProtected ? "Protected" : "Public"}</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN: Project Env Panel OR Endpoint Editor Card */}
      {viewingEnv ? (
        <section className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] min-w-0 tab-panel-animate">
          <div className="px-3.5 py-2.5 bg-[var(--surface-sub)] border-b border-[var(--border)] rounded-t-[10px] flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-[var(--ink)]">
              Environment
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3 h-3" />}
              onClick={() =>
                onChangeProjectEnvVars([
                  ...projectEnvVars,
                  {
                    id: `env-${Date.now()}`,
                    key: "",
                    value: "",
                    enabled: true,
                  },
                ])
              }
              className="shrink-0"
            >
              Add
            </Button>
          </div>

          <div className="min-h-[380px] p-4 space-y-3 text-xs">
            {projectEnvVars.length === 0 ? (
              <div className="py-12 text-center text-[var(--ink-muted)]">
                No variables.
              </div>
            ) : (
              <div className="space-y-1.5">
                {projectEnvVars.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[24px_1fr_1.4fr_30px] items-center gap-2"
                  >
                    <Checkbox
                      aria-label={`Enable ${row.key || "variable"}`}
                      checked={row.enabled}
                      onCheckedChange={(checked) =>
                        onChangeProjectEnvVars(
                          projectEnvVars.map((item) =>
                            item.id === row.id
                              ? { ...item, enabled: Boolean(checked) }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      type="text"
                      size="sm"
                      placeholder="TOKEN"
                      value={row.key}
                      onChange={(e) =>
                        onChangeProjectEnvVars(
                          projectEnvVars.map((item) =>
                            item.id === row.id
                              ? {
                                  ...item,
                                  key: e.target.value.replace(/\s+/g, "_"),
                                }
                              : item,
                          ),
                        )
                      }
                      className="font-mono"
                    />
                    <Input
                      type="text"
                      size="sm"
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) =>
                        onChangeProjectEnvVars(
                          projectEnvVars.map((item) =>
                            item.id === row.id
                              ? { ...item, value: e.target.value }
                              : item,
                          ),
                        )
                      }
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      shape="square"
                      onClick={() =>
                        onChangeProjectEnvVars(
                          projectEnvVars.filter((item) => item.id !== row.id),
                        )
                      }
                      aria-label="Remove environment variable"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
      <section className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] min-w-0">
        {/* Top Config Bar */}
        <div className="px-3.5 py-2.5 bg-[var(--surface-sub)] border-b border-[var(--border)] rounded-t-[10px] flex flex-wrap items-center gap-2 text-xs">
          <CleanSelect
            ariaLabel="HTTP Method"
            value={active.method}
            options={METHOD_OPTIONS}
            onChange={(method) => onChange({ ...active, method })}
            menuMinWidth="104px"
          />

          <Input
            aria-label="Endpoint path"
            type="text"
            size="sm"
            value={active.path}
            onChange={(e) => onChange({ ...active, path: e.target.value })}
            placeholder="/v1/users/:id"
            className="flex-1 min-w-[160px] font-mono"
          />

          <CleanSelect
            ariaLabel="HTTP Status Code"
            value={String(active.statusCode)}
            options={STATUS_OPTIONS}
            onChange={(val) => onChange({ ...active, statusCode: Number(val) })}
            align="right"
            menuMinWidth="84px"
          />

          <div
            className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-[7px] px-2 py-1.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <input
              aria-label="Delay in milliseconds"
              type="number"
              min={0}
              max={10000}
              step={50}
              value={active.delayMs}
              onChange={(e) =>
                onChange({
                  ...active,
                  delayMs: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-12 bg-transparent text-[var(--ink)] text-right outline-none"
            />
            <span className="text-[var(--ink-muted)] ml-1">ms</span>
          </div>

          {endpoints.length > 1 && (
            <button
              type="button"
              onClick={() => onDelete(active.id)}
              title="Delete endpoint"
              aria-label="Delete endpoint"
              className="tb-icon"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Postman-Style Sub-Tabs: Body | Params | Auth | Headers | Cookies */}
        <div className="px-3.5 border-b border-[var(--border)] flex items-center gap-5 text-xs bg-[var(--surface)]">
          {subTabs.map((t) => {
            const isSelected = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`relative py-2.5 font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                  isSelected
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                <span>{t.label}</span>
                {typeof t.count === "number" && t.count > 0 && (
                  <span
                    className="text-[10px] text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {t.count}
                  </span>
                )}
                {t.dot && (
                  <span className="text-[10px] text-[var(--accent)]">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                {isSelected && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[var(--accent)] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* SUB-TAB 1: BODY (Syntax-Highlighted JSON Editor) */}
        {subTab === "body" && (
          <div className="editor-pane">
            <div ref={gutterRef} className="editor-gutter" aria-hidden="true">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>
            <div className="relative flex-1 min-w-0">
              <pre
                ref={backdropRef}
                aria-hidden="true"
                className="editor-content m-0 min-h-[330px] pointer-events-none select-none overflow-hidden"
              >
                {highlightedJson}
              </pre>
              <textarea
                aria-label="JSON Response Body"
                spellCheck={false}
                value={active.responseBody}
                onChange={(e) =>
                  onChange({ ...active, responseBody: e.target.value })
                }
                onScroll={handleEditorScroll}
                placeholder='{ "ok": true }'
                className={`editor-content absolute inset-0 w-full h-full bg-transparent outline-none resize-none${
                  editorScroll.isScrolling ? " is-scrolling" : ""
                }`}
                style={{
                  color: active.responseBody ? "transparent" : "var(--ink)",
                  caretColor: "var(--ink)",
                }}
              />
            </div>
          </div>
        )}

        {/* SUB-TAB 2 & 4: PARAMS / HEADERS Key-Value Table */}
        {(subTab === "params" || subTab === "headers") && (
          <div className="min-h-[330px] p-3.5 space-y-2.5 text-xs">
            {active[subTab].length > 0 && (
              <div className="space-y-1.5">
                  {active[subTab].map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[20px_1fr_1fr_28px] items-center gap-2"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <input
                        type="checkbox"
                        checked={row.enabled}
                        onChange={(e) =>
                          updateKeyValueList(
                            subTab,
                            active[subTab].map((item) =>
                              item.id === row.id
                                ? { ...item, enabled: e.target.checked }
                                : item,
                            ),
                          )
                        }
                        className="accent-[var(--accent)] cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Key"
                        value={row.key}
                        onChange={(e) =>
                          updateKeyValueList(
                            subTab,
                            active[subTab].map((item) =>
                              item.id === row.id
                                ? { ...item, key: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[6px] px-2.5 py-1.5 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) =>
                          updateKeyValueList(
                            subTab,
                            active[subTab].map((item) =>
                              item.id === row.id
                                ? { ...item, value: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[6px] px-2.5 py-1.5 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateKeyValueList(
                            subTab,
                            active[subTab].filter(
                              (item) => item.id !== row.id,
                            ),
                          )
                        }
                        aria-label="Remove row"
                        className="tb-icon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            <button
              type="button"
              onClick={() => addKeyValueRow(subTab)}
              className="clean-btn"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        )}

        {/* SUB-TAB 3: AUTHORIZATION */}
        {subTab === "auth" && (
          <div className="min-h-[330px] p-4 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[var(--ink-muted)] w-24 shrink-0">
                Auth Type
              </span>
              <CleanSelect
                ariaLabel="Authorization type"
                value={active.auth.type}
                options={ENDPOINT_AUTH_OPTIONS}
                mono={false}
                menuMinWidth="180px"
                onChange={(type) =>
                  onChange({
                    ...active,
                    auth: { ...active.auth, type },
                  })
                }
              />
            </div>

            {active.auth.type === "inherit" && (
              <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--ink-muted)] w-24 shrink-0">
                    Project Auth
                  </span>
                  <CleanSelect
                    ariaLabel="Project default authorization"
                    value={
                      projectAuth.type === "inherit" ? "none" : projectAuth.type
                    }
                    options={PROJECT_AUTH_OPTIONS}
                    mono={false}
                    menuMinWidth="160px"
                    onChange={(type) =>
                      onChangeProjectAuth({ ...projectAuth, type })
                    }
                  />
                </div>
                {projectAuth.type !== "none" && (
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--ink-muted)] w-24 shrink-0">
                      Value
                    </span>
                    <input
                      type="text"
                      placeholder="Token or {{API_TOKEN}}"
                      value={projectAuth.token}
                      onChange={(e) =>
                        onChangeProjectAuth({
                          ...projectAuth,
                          token: e.target.value,
                        })
                      }
                      className="flex-1 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[7px] px-2.5 py-1.5 outline-none"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                )}
                {projectAuth.token.includes("{{") && (
                  <p
                    className="text-[var(--ink-muted)] pl-[108px]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    resolved: {resolveEnvValue(projectAuth.token, projectEnvVars)}
                  </p>
                )}
              </div>
            )}

            {active.auth.type === "bearer" && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--ink-muted)] w-24 shrink-0">
                    Token
                  </span>
                  <input
                    type="text"
                    placeholder="Bearer token or *"
                    value={active.auth.token}
                    onChange={(e) =>
                      onChange({
                        ...active,
                        auth: { ...active.auth, token: e.target.value },
                      })
                    }
                    className="flex-1 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[7px] px-2.5 py-1.5 outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>
            )}

            {active.auth.type === "api_key" && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--ink-muted)] w-24 shrink-0">
                    Header Key
                  </span>
                  <input
                    type="text"
                    placeholder="x-api-key"
                    value={active.auth.headerName}
                    onChange={(e) =>
                      onChange({
                        ...active,
                        auth: { ...active.auth, headerName: e.target.value },
                      })
                    }
                    className="flex-1 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[7px] px-2.5 py-1.5 outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--ink-muted)] w-24 shrink-0">
                    Value
                  </span>
                  <input
                    type="text"
                    placeholder="sk_test_..."
                    value={active.auth.token}
                    onChange={(e) =>
                      onChange({
                        ...active,
                        auth: { ...active.auth, token: e.target.value },
                      })
                    }
                    className="flex-1 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[7px] px-2.5 py-1.5 outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>
            )}

            {active.auth.type === "basic" && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--ink-muted)] w-24 shrink-0">
                    Username
                  </span>
                  <input
                    type="text"
                    placeholder="admin"
                    value={active.auth.username}
                    onChange={(e) =>
                      onChange({
                        ...active,
                        auth: { ...active.auth, username: e.target.value },
                      })
                    }
                    className="flex-1 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[7px] px-2.5 py-1.5 outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--ink-muted)] w-24 shrink-0">
                    Password
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={active.auth.password}
                    onChange={(e) =>
                      onChange({
                        ...active,
                        auth: { ...active.auth, password: e.target.value },
                      })
                    }
                    className="flex-1 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[7px] px-2.5 py-1.5 outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 5: COOKIES */}
        {subTab === "cookies" && (
          <div className="min-h-[330px] p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[var(--ink-muted)]">
                Set-Cookie Headers
              </span>
              <button
                type="button"
                onClick={addCookieRow}
                className="clean-btn"
              >
                <Plus className="w-3 h-3" />
                <span>Add Cookie</span>
              </button>
            </div>

            {active.cookies.length === 0 ? (
              <div className="py-12 text-center text-[var(--ink-muted)]">
                No cookies configured.
              </div>
            ) : (
              <div className="space-y-1.5">
                {active.cookies.map((ck) => (
                  <div
                    key={ck.id}
                    className="flex flex-wrap items-center gap-2"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <input
                      type="checkbox"
                      checked={ck.enabled}
                      onChange={(e) =>
                        updateCookieList(
                          active.cookies.map((item) =>
                            item.id === ck.id
                              ? { ...item, enabled: e.target.checked }
                              : item,
                          ),
                        )
                      }
                      className="accent-[var(--accent)] cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="name"
                      value={ck.name}
                      onChange={(e) =>
                        updateCookieList(
                          active.cookies.map((item) =>
                            item.id === ck.id
                              ? { ...item, name: e.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-36 bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[6px] px-2.5 py-1.5 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="value"
                      value={ck.value}
                      onChange={(e) =>
                        updateCookieList(
                          active.cookies.map((item) =>
                            item.id === ck.id
                              ? { ...item, value: e.target.value }
                              : item,
                          ),
                        )
                      }
                      className="flex-1 min-w-[140px] bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] focus:border-[var(--border-strong)] rounded-[6px] px-2.5 py-1.5 outline-none"
                    />
                    <label className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ck.httpOnly}
                        onChange={(e) =>
                          updateCookieList(
                            active.cookies.map((item) =>
                              item.id === ck.id
                                ? { ...item, httpOnly: e.target.checked }
                                : item,
                            ),
                          )
                        }
                        className="accent-[var(--accent)]"
                      />
                      HttpOnly
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ck.secure}
                        onChange={(e) =>
                          updateCookieList(
                            active.cookies.map((item) =>
                              item.id === ck.id
                                ? { ...item, secure: e.target.checked }
                                : item,
                            ),
                          )
                        }
                        className="accent-[var(--accent)]"
                      />
                      Secure
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateCookieList(
                          active.cookies.filter((item) => item.id !== ck.id),
                        )
                      }
                      aria-label="Remove cookie"
                      className="tb-icon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiet Footer with Subtle Copy URL */}
        <div className="px-3.5 py-2.5 bg-[var(--surface-sub)] border-t border-[var(--border)] rounded-b-[10px] flex flex-wrap items-center justify-end gap-2 text-xs">
          {subTab === "body" && jsonError && (
            <span className="text-[var(--danger)] text-xs mr-auto">{jsonError}</span>
          )}
          {lastTestLabel && !jsonError && (
            <span
              className="text-[var(--ink-muted)] text-xs mr-auto"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {lastTestLabel}
            </span>
          )}
          {subTab === "body" && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFormat}
              disabled={Boolean(jsonError)}
            >
              Format
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onTest}
            loading={testing}
            icon={<Play className="w-3 h-3" />}
          >
            {testing ? "Testing..." : "Test"}
          </Button>
        </div>
      </section>
      )}
    </div>
  );
}
