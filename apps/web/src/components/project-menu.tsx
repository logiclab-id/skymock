import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input } from "@cloudflare/kumo";
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import type { MockProject } from "@/types/mock";

interface ProjectMenuProps {
  projects: MockProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onRenameProject: (id: string, nextName: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProjectClick: () => void;
}

export function ProjectMenu({
  projects,
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onNewProjectClick,
}: ProjectMenuProps) {
  const [menuState, setMenuState] = useState<"closed" | "open" | "closing">(
    "closed"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const active =
    projects.find((p) => p.id === activeProjectId) ?? projects[0];

  const closeMenu = useCallback(() => {
    setMenuState((prev) => {
      if (prev !== "open") return prev;
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => {
        setMenuState("closed");
        setEditingId(null);
      }, 200);
      return "closing";
    });
  }, []);

  const toggleMenu = () => {
    if (menuState === "open") {
      closeMenu();
      return;
    }
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setMenuState("open");
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (menuState !== "open") return;

    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingId) {
          setEditingId(null);
        } else {
          closeMenu();
        }
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuState, editingId, closeMenu]);

  const startRename = (project: MockProject) => {
    setEditingId(project.id);
    setDraftName(project.name);
  };

  const commitRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed) {
      onRenameProject(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div ref={rootRef} className="inline-flex items-center gap-1">
      <div className="relative">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label="Active project"
          aria-haspopup="menu"
          aria-expanded={menuState === "open"}
          onClick={toggleMenu}
          className="font-mono"
        >
          <span className="truncate max-w-[140px]">{active.slug}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0 transition-transform duration-150 ${
              menuState === "open" ? "rotate-180" : ""
            }`}
          />
        </Button>

        {menuState !== "closed" && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] z-50 w-[210px]">
            <div
              role="menu"
              data-state={menuState}
              className="project-genie-menu p-1.5 rounded-[10px] border border-[var(--border-strong)] bg-[var(--popover)] shadow-xl"
            >
              <div className="px-2 py-1.5 mb-1 border-b border-[var(--border)]">
                <span
                  className="text-base font-bold leading-none text-[var(--ink)]"
                  style={{ fontFamily: "var(--font-hand)" }}
                >
                  Projects
                </span>
              </div>

              <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
                {projects.map((proj) => {
                  const isSelected = proj.id === activeProjectId;
                  const isEditing = editingId === proj.id;

                  if (isEditing) {
                    return (
                      <form
                        key={proj.id}
                        onSubmit={(e) => commitRename(e, proj.id)}
                        className="flex items-center gap-1 px-1.5 py-1"
                      >
                        <Input
                          type="text"
                          size="xs"
                          autoFocus
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="Project name"
                          className="flex-1 min-w-0"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="xs"
                          shape="square"
                          title="Save name"
                          aria-label="Save name"
                          icon={<Check className="w-3.5 h-3.5 text-emerald-500" />}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          shape="square"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                          aria-label="Cancel"
                          icon={<X className="w-3.5 h-3.5" />}
                        />
                      </form>
                    );
                  }

                  return (
                    <div
                      key={proj.id}
                      className={`group flex items-center justify-between gap-1 rounded-[7px] px-2 py-1.5 transition-colors ${
                        isSelected
                          ? "bg-[var(--surface-hover)] text-[var(--ink)]"
                          : "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProject(proj.id);
                          closeMenu();
                        }}
                        className="flex-1 min-w-0 text-left text-xs font-medium truncate cursor-pointer"
                      >
                        {proj.name}
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(proj);
                          }}
                          title="Rename project"
                          aria-label={`Rename ${proj.name}`}
                          className="tb-icon opacity-60 group-hover:opacity-100"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject(proj.id);
                            }}
                            title="Delete project"
                            aria-label={`Delete ${proj.name}`}
                            className="tb-icon opacity-60 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-1 pt-1 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onNewProjectClick();
                  }}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-[7px] text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New project</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        shape="square"
        onClick={() => {
          closeMenu();
          onNewProjectClick();
        }}
        title="New project"
        aria-label="New project"
        icon={<Plus className="w-3.5 h-3.5" />}
      />
    </div>
  );
}
