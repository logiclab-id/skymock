import { Badge, Button } from "@cloudflare/kumo";
import { Play, Trash2 } from "lucide-react";
import type { HttpMethod, RequestLog } from "@/types/mock";

interface LogsPanelProps {
  logs: RequestLog[];
  onSimulate: () => void;
  onClear: () => void;
}

const METHOD_BADGE: Record<
  HttpMethod,
  "blue" | "green" | "orange" | "purple" | "red"
> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  PATCH: "purple",
  DELETE: "red",
};

function statusVariant(code: number): "error" | "warning" | "success" {
  if (code >= 500) return "error";
  if (code >= 400) return "warning";
  return "success";
}

export function LogsPanel({ logs, onSimulate, onClear }: LogsPanelProps) {
  return (
    <div className="tab-panel-animate space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSimulate}
          icon={<Play className="w-3 h-3" />}
        >
          Simulate
        </Button>
        {logs.length > 0 && (
          <Button
            type="button"
            variant="secondary-destructive"
            size="sm"
            onClick={onClear}
            icon={<Trash2 className="w-3 h-3" />}
          >
            Clear
          </Button>
        )}
      </div>

      <div
        className="clean-card divide-y divide-[var(--border)] text-xs"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {logs.length === 0 ? (
          <div className="px-4 py-12 text-center text-[var(--ink-muted)]">
            No requests yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Badge variant={METHOD_BADGE[log.method]}>{log.method}</Badge>
                <Badge variant={statusVariant(log.statusCode)}>
                  {log.statusCode}
                </Badge>
                <span className="truncate text-[var(--ink)]">{log.path}</span>
              </div>
              <div className="flex items-center gap-4 text-[var(--ink-muted)] shrink-0">
                <span>{log.delayMs}ms</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
