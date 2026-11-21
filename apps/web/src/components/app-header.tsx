import { useEffect, useRef } from "react";
import { MarkerSwoosh, SketchUnderline } from "@/components/doodles";
import { ProjectMenu } from "@/components/project-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { ActiveTab, MockProject } from "@/types/mock";

interface AppHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  projects: MockProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onRenameProject: (id: string, nextName: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProjectClick: () => void;
}

const TABS: ReadonlyArray<{ id: ActiveTab; label: string }> = [
  { id: "endpoints", label: "Endpoints" },
  { id: "logs", label: "Logs" },
  { id: "docs", label: "Docs" },
];

export function AppHeader({
  activeTab,
  onTabChange,
  projects,
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onNewProjectClick,
}: AppHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const updateHeight = () => {
      const height = Math.floor(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${height}px`
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const brandStyle: React.CSSProperties = {
    position: "relative",
    fontFamily: "var(--font-hand)",
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1,
    color: "var(--ink)",
    transform: "rotate(-1.5deg)",
    display: "inline-block",
    textDecoration: "none",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  };

  return (
    <header ref={headerRef} className="app-header">
      <button
        type="button"
        onClick={() => onTabChange("endpoints")}
        className="app-header-brand"
        style={brandStyle}
      >
        Skymock
        <MarkerSwoosh color="var(--marker-warm)" />
      </button>

      <nav className="app-header-nav" aria-label="Primary">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                background: "none",
                border: "none",
                color: isActive ? "var(--ink)" : "var(--ink-muted)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                position: "relative",
                padding: "0.2rem 0.1rem",
              }}
            >
              {tab.label}
              {isActive && <SketchUnderline className="tab-underline" />}
            </button>
          );
        })}
      </nav>

      <div className="app-header-actions">
        <ProjectMenu
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={onSelectProject}
          onRenameProject={onRenameProject}
          onDeleteProject={onDeleteProject}
          onNewProjectClick={onNewProjectClick}
        />

        <ThemeSwitcher />
      </div>
    </header>
  );
}
