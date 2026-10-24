import { Check, Minus } from "lucide-react";
import { MATRIX, PLANS, type Cell } from "@/lib/catalog";
import { cn } from "@/lib/cn";

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span aria-label="Included" className="inline-grid h-5 w-5 place-items-center rounded-full bg-success-bg text-success">
        <Check size={12} strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (value === false) {
    return (
      <span aria-label="Not included" className="inline-grid h-5 w-5 place-items-center text-content-muted">
        <Minus size={14} aria-hidden />
      </span>
    );
  }
  return <span className="font-mono text-xs text-content-secondary">{value}</span>;
}

/** Full feature matrix from lib/catalog. Scrolls sideways on phones. */
export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-4 text-sm font-medium text-content-muted">
              Features
            </th>
            {PLANS.map((p) => (
              <th key={p.id} scope="col" className={cn("px-5 py-4 text-center font-display text-base font-bold", p.highlighted ? "text-brand" : "text-content")}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        {MATRIX.map((group) => (
          <tbody key={group.group}>
            <tr className="border-b border-border bg-surface-raised">
              <th scope="rowgroup" colSpan={5} className="px-5 py-2.5 font-mono text-xs uppercase tracking-caps text-content-muted">
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <th scope="row" className="px-5 py-3 text-sm font-normal text-content-secondary">
                  {row.tip ? (
                    <span title={row.tip} className="cursor-help underline decoration-dotted underline-offset-4">
                      {row.label}
                    </span>
                  ) : (
                    row.label
                  )}
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className="px-5 py-3 text-center">
                    <CellValue value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
