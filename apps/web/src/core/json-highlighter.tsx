import type { ReactNode } from "react";

const JSON_TOKEN_REGEX =
  /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

const TEMPLATE_VAR_REGEX = /(\{\{\$[a-zA-Z0-9_.-]+\}\})/g;

function renderStringWithTemplates(raw: string, keyPrefix: string): ReactNode {
  const parts = raw.split(TEMPLATE_VAR_REGEX);
  if (parts.length === 1) return raw;
  return parts.map((part, idx) =>
    part.startsWith("{{$") && part.endsWith("}}") ? (
      <span
        key={`${keyPrefix}-tpl-${idx}`}
        style={{ color: "var(--accent)", fontWeight: 500 }}
      >
        {part}
      </span>
    ) : (
      <span key={`${keyPrefix}-txt-${idx}`}>{part}</span>
    )
  );
}

export function highlightJson(source: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  JSON_TOKEN_REGEX.lastIndex = 0;
  while ((match = JSON_TOKEN_REGEX.exec(source)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`p-${idx++}`} className="text-[var(--ink-muted)]">
          {source.slice(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    const isKey = Boolean(match[2]);

    if (isKey) {
      const colonIdx = token.lastIndexOf(":");
      const keyPart = token.slice(0, colonIdx);
      const colonPart = token.slice(colonIdx);
      nodes.push(
        <span key={`k-${idx++}`}>
          <span className="tok-key">{keyPart}</span>
          <span className="text-[var(--ink-muted)]">{colonPart}</span>
        </span>
      );
    } else if (token.startsWith('"')) {
      nodes.push(
        <span key={`s-${idx++}`} className="tok-str">
          {renderStringWithTemplates(token, `s-${idx}`)}
        </span>
      );
    } else if (token === "true" || token === "false" || token === "null") {
      nodes.push(
        <span key={`b-${idx++}`} className="tok-bool">
          {token}
        </span>
      );
    } else {
      nodes.push(
        <span key={`n-${idx++}`} className="tok-num">
          {token}
        </span>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < source.length) {
    nodes.push(
      <span key={`tail-${idx++}`} className="text-[var(--ink-muted)]">
        {source.slice(lastIndex)}
      </span>
    );
  }

  // Trailing newline keeps <pre> height synced with <textarea> when ending on empty line
  if (source.endsWith("\n")) {
    nodes.push("\n");
  }

  return nodes;
}
