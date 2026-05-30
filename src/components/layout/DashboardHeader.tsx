interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
}

export function DashboardHeader({
  title,
  subtitle,
  userName,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 border-b border-slate-200 pb-4 pl-28">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <span className="text-sm text-slate-600">
          Signed in as <span className="font-semibold">{userName}</span>
        </span>
      </div>
    </header>
  );
}
