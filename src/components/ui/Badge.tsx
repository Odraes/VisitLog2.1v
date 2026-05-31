import { VisitorStatus } from "@/types/visitor.types";

const STYLES: Record<VisitorStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  TIMED_IN: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  TIMED_OUT: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const LABELS: Record<VisitorStatus, string> = {
  PENDING: "Pending",
  TIMED_IN: "Inside",
  TIMED_OUT: "Left",
};

export function StatusBadge({ status }: { status: VisitorStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
