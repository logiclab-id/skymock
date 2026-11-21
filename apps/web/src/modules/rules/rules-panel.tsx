import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CleanSelect } from "@/components/clean-select";
import type { EndpointRule, RuleConditionType } from "@/types/mock";

interface RulesPanelProps {
  rules: EndpointRule[];
  onAdd: (rule: Omit<EndpointRule, "id" | "priority">) => void;
  onDelete: (id: string) => void;
}

const OPERATOR_LABEL: Record<EndpointRule["operator"], string> = {
  exists: "is missing",
  equals: "==",
  not_matches: "!~",
};

const CONDITION_OPTIONS = [
  { value: "header" as const, label: "header" },
  { value: "body" as const, label: "body" },
  { value: "query" as const, label: "query" },
];

const OPERATOR_OPTIONS = [
  { value: "equals" as const, label: "==" },
  { value: "not_matches" as const, label: "!~" },
  { value: "exists" as const, label: "is missing" },
];

const STATUS_OPTIONS = ["400", "401", "403", "422", "429", "500"].map((s) => ({
  value: s,
  label: s,
}));

export function RulesPanel({ rules, onAdd, onDelete }: RulesPanelProps) {
  const [adding, setAdding] = useState(false);
  const [conditionType, setConditionType] =
    useState<RuleConditionType>("header");
  const [conditionKey, setConditionKey] = useState("");
  const [operator, setOperator] = useState<EndpointRule["operator"]>("equals");
  const [expectedValue, setExpectedValue] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("401");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionKey.trim()) return;
    onAdd({
      conditionType,
      conditionKey: conditionKey.trim(),
      operator,
      expectedValue: expectedValue.trim(),
      overrideStatus: Number(overrideStatus),
    });
    setConditionKey("");
    setExpectedValue("");
    setAdding(false);
  };

  return (
    <div className="tab-panel-animate space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--ink-muted)]">
          Evaluated top to bottom
        </span>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="clean-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{adding ? "Cancel" : "Add Rule"}</span>
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit}
          className="clean-card p-3 flex flex-wrap items-center gap-2 text-xs overflow-visible"
        >
          <CleanSelect
            ariaLabel="Condition type"
            value={conditionType}
            options={CONDITION_OPTIONS}
            onChange={setConditionType}
            menuMinWidth="110px"
          />

          <input
            type="text"
            placeholder="key (e.g. email)"
            value={conditionKey}
            onChange={(e) => setConditionKey(e.target.value)}
            className="flex-1 min-w-[120px] bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] rounded-[7px] px-2.5 py-1.5 outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />

          <CleanSelect
            ariaLabel="Operator"
            value={operator}
            options={OPERATOR_OPTIONS}
            onChange={setOperator}
            menuMinWidth="120px"
          />

          {operator !== "exists" && (
            <input
              type="text"
              placeholder="value"
              value={expectedValue}
              onChange={(e) => setExpectedValue(e.target.value)}
              className="flex-1 min-w-[120px] bg-[var(--surface-sub)] text-[var(--ink)] border border-[var(--border)] rounded-[7px] px-2.5 py-1.5 outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          )}

          <CleanSelect
            ariaLabel="Override status"
            value={overrideStatus}
            options={STATUS_OPTIONS}
            onChange={setOverrideStatus}
            menuMinWidth="84px"
          />

          <button type="submit" className="clean-btn text-[var(--ink)]">
            Save
          </button>
        </form>
      )}

      <div
        className="clean-card divide-y divide-[var(--border)] text-xs"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {rules.length === 0 ? (
          <div className="px-4 py-8 text-center text-[var(--ink-muted)]">
            No rules configured.
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="px-4 py-3 flex items-center justify-between gap-4"
            >
              <span className="truncate text-[var(--ink)]">
                {rule.conditionType}.{rule.conditionKey}{" "}
                <span className="text-[var(--ink-muted)]">
                  {OPERATOR_LABEL[rule.operator]}
                </span>{" "}
                {rule.operator !== "exists" && `"${rule.expectedValue}"`}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-semibold ${
                    rule.overrideStatus >= 500
                      ? "text-rose-500"
                      : "text-amber-500"
                  }`}
                >
                  {rule.overrideStatus}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(rule.id)}
                  aria-label="Delete rule"
                  className="tb-icon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
