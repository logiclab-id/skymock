import { Button, Input } from "@cloudflare/kumo";
import { AppHeader } from "@/components/app-header";
import { DocsView } from "@/modules/docs/docs-view";
import { EndpointEditor } from "@/modules/endpoints/endpoint-editor";
import { LogsPanel } from "@/modules/inspector/logs-panel";
import type {
  ActiveTab,
  EndpointAuth,
  MockEndpoint,
  MockProject,
  RequestLog,
} from "@/types/mock";
import { useEffect, useState } from "react";

const DEFAULT_AUTH: EndpointAuth = {
  type: "none",
  token: "",
  headerName: "x-api-key",
  username: "",
  password: "",
};

const INITIAL_PROJECTS: MockProject[] = [
  {
    id: "proj-1",
    name: "Acme Mobile",
    slug: "acme-mobile",
    isProtected: false,
    defaultAuth: { ...DEFAULT_AUTH, type: "bearer", token: "{{API_TOKEN}}" },
    envVars: [
      { id: "env-1", key: "API_TOKEN", value: "sky_demo_token", enabled: true },
    ],
    defaultHeaders: [
      { id: "ph-1", key: "X-App-Platform", value: "mobile", enabled: true },
      { id: "ph-2", key: "X-API-Version", value: "1.0", enabled: true },
    ],
    endpoints: [
      {
        id: "ep-1",
        method: "GET",
        path: "/v1/users/:id",
        statusCode: 200,
        delayMs: 200,
        responseBody: JSON.stringify(
          {
            id: "{{$params.id}}",
            traceId: "{{$uuid}}",
            name: "Nadia Pratama",
            role: "developer",
            createdAt: "{{$isoTimestamp}}",
          },
          null,
          2,
        ),
        params: [
          { id: "p-1", key: "include", value: "profile", enabled: true },
        ],
        auth: {
          ...DEFAULT_AUTH,
          type: "inherit",
        },
        headers: [
          {
            id: "h-1",
            key: "Content-Type",
            value: "application/json",
            enabled: true,
          },
          {
            id: "h-2",
            key: "X-Request-Id",
            value: "{{$uuid}}",
            enabled: true,
          },
        ],
        cookies: [],
      },
      {
        id: "ep-2",
        method: "POST",
        path: "/v1/auth/login",
        statusCode: 201,
        delayMs: 150,
        responseBody: JSON.stringify(
          {
            token: "sky_{{$uuid}}",
            email: "{{$body.email}}",
            issuedAt: "{{$isoTimestamp}}",
          },
          null,
          2,
        ),
        params: [],
        auth: { ...DEFAULT_AUTH },
        headers: [
          {
            id: "h-3",
            key: "Content-Type",
            value: "application/json",
            enabled: true,
          },
        ],
        cookies: [
          {
            id: "ck-1",
            name: "session_id",
            value: "sky_{{$uuid}}",
            httpOnly: true,
            secure: true,
            enabled: true,
          },
        ],
      },
      {
        id: "ep-3",
        method: "DELETE",
        path: "/v1/sessions/:id",
        statusCode: 429,
        delayMs: 500,
        responseBody: JSON.stringify(
          {
            error: "Too Many Requests",
            retryAfter: 30,
          },
          null,
          2,
        ),
        params: [],
        auth: { ...DEFAULT_AUTH, type: "bearer", token: "*" },
        headers: [
          { id: "h-4", key: "Retry-After", value: "30", enabled: true },
        ],
        cookies: [],
      },
    ],
    rules: [
      {
        id: "rule-1",
        priority: 1,
        conditionType: "header",
        conditionKey: "Authorization",
        operator: "not_matches",
        expectedValue: "Bearer *",
        overrideStatus: 401,
      },
      {
        id: "rule-2",
        priority: 2,
        conditionType: "body",
        conditionKey: "email",
        operator: "exists",
        expectedValue: "",
        overrideStatus: 422,
      },
    ],
    logs: [
      {
        id: "log-1",
        method: "GET",
        path: "/v1/users/42",
        statusCode: 200,
        delayMs: 204,
        timestamp: "now",
      },
      {
        id: "log-2",
        method: "POST",
        path: "/v1/auth/login",
        statusCode: 401,
        delayMs: 12,
        timestamp: "1m",
      },
    ],
  },
  {
    id: "proj-2",
    name: "Payment API",
    slug: "payment-api",
    isProtected: true,
    defaultAuth: {
      ...DEFAULT_AUTH,
      type: "api_key",
      headerName: "x-api-key",
      token: "{{PAYMENT_KEY}}",
    },
    envVars: [
      { id: "env-p1", key: "PAYMENT_KEY", value: "sk_test_demo", enabled: true },
    ],
    defaultHeaders: [
      {
        id: "ph-p1",
        key: "X-Merchant-Id",
        value: "mch_live_01",
        enabled: true,
      },
      { id: "ph-p2", key: "Cache-Control", value: "no-store", enabled: true },
    ],
    endpoints: [
      {
        id: "ep-p1",
        method: "POST",
        path: "/v1/charges",
        statusCode: 201,
        delayMs: 300,
        responseBody: JSON.stringify(
          {
            chargeId: "ch_{{$uuid}}",
            status: "paid",
            createdAt: "{{$isoTimestamp}}",
          },
          null,
          2,
        ),
        params: [],
        auth: {
          ...DEFAULT_AUTH,
          type: "inherit",
        },
        headers: [
          {
            id: "hp-1",
            key: "Content-Type",
            value: "application/json",
            enabled: true,
          },
        ],
        cookies: [],
      },
      {
        id: "ep-p2",
        method: "GET",
        path: "/v1/invoices/:id",
        statusCode: 200,
        delayMs: 120,
        responseBody: JSON.stringify(
          {
            invoiceId: "{{$params.id}}",
            amount: 250000,
            currency: "IDR",
          },
          null,
          2,
        ),
        params: [],
        auth: { ...DEFAULT_AUTH },
        headers: [],
        cookies: [],
      },
    ],
    rules: [
      {
        id: "rule-p1",
        priority: 1,
        conditionType: "body",
        conditionKey: "amount",
        operator: "exists",
        expectedValue: "",
        overrideStatus: 422,
      },
    ],
    logs: [
      {
        id: "log-p1",
        method: "POST",
        path: "/v1/charges",
        statusCode: 201,
        delayMs: 305,
        timestamp: "2m",
      },
    ],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("endpoints");
  const [projects, setProjects] = useState<MockProject[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(
    INITIAL_PROJECTS[0].id,
  );
  const [activeEndpointId, setActiveEndpointId] = useState<string>(
    INITIAL_PROJECTS[0].endpoints[0].id,
  );
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [testing, setTesting] = useState(false);
  const [lastTestLabel, setLastTestLabel] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const onGlobalScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 900);
    };
    window.addEventListener("scroll", onGlobalScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onGlobalScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const activeEndpoint =
    activeProject.endpoints.find((e) => e.id === activeEndpointId) ??
    activeProject.endpoints[0];

  const updateActiveProject = (
    updater: (project: MockProject) => MockProject,
  ) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? updater(p) : p)),
    );
  };

  const handleSelectProject = (id: string) => {
    const next = projects.find((p) => p.id === id);
    if (!next) return;
    setActiveProjectId(next.id);
    setActiveEndpointId(next.endpoints[0].id);
    setLastTestLabel(null);
  };

  const handleRenameProject = (id: string, nextName: string) => {
    const baseSlug = slugify(nextName) || `project-${Date.now()}`;
    const slugTaken = projects.some((p) => p.id !== id && p.slug === baseSlug);
    const nextSlug = slugTaken
      ? `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`
      : baseSlug;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: nextName, slug: nextSlug } : p,
      ),
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(remaining[0].id);
        setActiveEndpointId(remaining[0].endpoints[0].id);
        setLastTestLabel(null);
      }
      return remaining;
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;

    const baseSlug = slugify(name) || `project-${Date.now()}`;
    const slugExists = projects.some((p) => p.slug === baseSlug);
    const slug = slugExists
      ? `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`
      : baseSlug;

    const firstEndpointId = `ep-${Date.now()}`;
    const newProject: MockProject = {
      id: `proj-${Date.now()}`,
      name,
      slug,
      isProtected: false,
      defaultAuth: { ...DEFAULT_AUTH },
      envVars: [],
      defaultHeaders: [
        {
          id: `ph-${Date.now()}`,
          key: "Content-Type",
          value: "application/json",
          enabled: true,
        },
      ],
      endpoints: [
        {
          id: firstEndpointId,
          method: "GET",
          path: "/v1/health",
          statusCode: 200,
          delayMs: 100,
          responseBody: JSON.stringify(
            {
              ok: true,
              project: slug,
              timestamp: "{{$isoTimestamp}}",
            },
            null,
            2,
          ),
          params: [],
          auth: { ...DEFAULT_AUTH, type: "inherit" },
          headers: [
            {
              id: `h-${Date.now()}`,
              key: "Content-Type",
              value: "application/json",
              enabled: true,
            },
          ],
          cookies: [],
        },
      ],
      rules: [],
      logs: [],
    };

    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setActiveEndpointId(firstEndpointId);
    setNewProjectName("");
    setCreatingProject(false);
    setLastTestLabel(null);
  };

  const handleAddEndpoint = () => {
    const now = Date.now();
    const id = `ep-${now}`;
    const clonedHeaders = activeEndpoint.headers.map((h, idx) => ({
      ...h,
      id: `h-${now}-${idx}`,
    }));
    const next: MockEndpoint = {
      id,
      method: "GET",
      path: "/v1/items/:id",
      statusCode: 200,
      delayMs: 100,
      responseBody: JSON.stringify({ id: "{{$params.id}}" }, null, 2),
      params: [],
      auth: { ...activeEndpoint.auth },
      headers: clonedHeaders,
      cookies: [],
    };
    updateActiveProject((p) => ({ ...p, endpoints: [...p.endpoints, next] }));
    setActiveEndpointId(id);
    setLastTestLabel(null);
  };

  const handleDeleteEndpoint = (id: string) => {
    if (activeProject.endpoints.length <= 1) return;
    const filtered = activeProject.endpoints.filter((e) => e.id !== id);
    updateActiveProject((p) => ({ ...p, endpoints: filtered }));
    if (activeEndpointId === id) {
      setActiveEndpointId(filtered[0].id);
    }
  };

  const handleUpdateEndpoint = (updated: MockEndpoint) => {
    updateActiveProject((p) => ({
      ...p,
      endpoints: p.endpoints.map((ep) => (ep.id === updated.id ? updated : ep)),
    }));
  };

  const handleToggleProtected = () => {
    const nextProtected = !activeProject.isProtected;
    updateActiveProject((p) => ({ ...p, isProtected: nextProtected }));
  };

  const handleTestEndpoint = () => {
    if (testing) return;
    setTesting(true);
    const simulatedDelay = Math.min(activeEndpoint.delayMs, 600);
    window.setTimeout(() => {
      const resolvedPath = activeEndpoint.path.replace(
        /:([a-zA-Z0-9_]+)/g,
        "42",
      );
      const entry: RequestLog = {
        id: `log-${Date.now()}`,
        method: activeEndpoint.method,
        path: resolvedPath,
        statusCode: activeEndpoint.statusCode,
        delayMs: activeEndpoint.delayMs,
        timestamp: "now",
      };
      updateActiveProject((p) => ({ ...p, logs: [entry, ...p.logs] }));
      setLastTestLabel(
        `${activeEndpoint.statusCode} · ${activeEndpoint.delayMs}ms`,
      );
      setTesting(false);
    }, simulatedDelay);
  };

  return (
    <div className="app-shell">
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projects={projects}
        activeProjectId={activeProject.id}
        onSelectProject={handleSelectProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onNewProjectClick={() => setCreatingProject((v) => !v)}
      />

      <main className="relative z-[1] w-full max-w-[1040px] mx-auto pt-5 flex-1 space-y-4">
        {creatingProject && (
          <form
            onSubmit={handleCreateProject}
            className="clean-card p-3 flex flex-wrap items-center gap-2 text-xs tab-panel-animate"
          >
            <Input
              type="text"
              size="sm"
              autoFocus
              placeholder="Project name (e.g. Storefront App)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <span
              className="text-[var(--ink-muted)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              /m/{slugify(newProjectName) || "project-slug"}
            </span>
            <Button type="submit" variant="primary" size="sm">
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setCreatingProject(false);
                setNewProjectName("");
              }}
            >
              Cancel
            </Button>
          </form>
        )}

        {activeTab === "endpoints" && (
          <EndpointEditor
            projectName={activeProject.name}
            isProtected={activeProject.isProtected}
            projectAuth={activeProject.defaultAuth}
            projectEnvVars={activeProject.envVars}
            endpoints={activeProject.endpoints}
            activeId={activeEndpoint.id}
            testing={testing}
            lastTestLabel={lastTestLabel}
            onSelect={(id) => {
              setActiveEndpointId(id);
              setLastTestLabel(null);
            }}
            onAdd={handleAddEndpoint}
            onDelete={handleDeleteEndpoint}
            onChange={handleUpdateEndpoint}
            onChangeProjectAuth={(defaultAuth) =>
              updateActiveProject((p) => ({ ...p, defaultAuth }))
            }
            onChangeProjectEnvVars={(envVars) =>
              updateActiveProject((p) => ({ ...p, envVars }))
            }
            onTest={handleTestEndpoint}
            onToggleProtected={handleToggleProtected}
          />
        )}

        {activeTab === "logs" && (
          <LogsPanel
            logs={activeProject.logs}
            onSimulate={handleTestEndpoint}
            onClear={() => updateActiveProject((p) => ({ ...p, logs: [] }))}
          />
        )}

        {activeTab === "docs" && (
          <DocsView
            projectSlug={activeProject.slug}
            isProtected={activeProject.isProtected}
          />
        )}
      </main>
    </div>
  );
}

export default App;
