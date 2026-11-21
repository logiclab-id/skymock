import { Select } from "@cloudflare/kumo";

export interface CleanSelectOption<T extends string> {
  value: T;
  label: string;
  className?: string;
}

interface CleanSelectProps<T extends string> {
  value: T;
  options: ReadonlyArray<CleanSelectOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  align?: "left" | "right";
  mono?: boolean;
  className?: string;
  menuMinWidth?: string;
}

export function CleanSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  align = "left",
  mono = true,
  className = "",
}: CleanSelectProps<T>) {
  const items: Record<string, string> = {};
  for (const opt of options) {
    items[opt.value] = opt.label;
  }

  return (
    <Select
      aria-label={ariaLabel}
      size="sm"
      align={align === "right" ? "end" : "start"}
      value={value}
      items={items}
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
      className={`${mono ? "font-mono" : ""} ${className}`.trim()}
    >
      {options.map((opt) => (
        <Select.Option
          key={opt.value}
          value={opt.value}
          className={`${mono ? "font-mono" : ""} ${opt.className ?? ""}`.trim()}
        >
          {opt.label}
        </Select.Option>
      ))}
    </Select>
  );
}
