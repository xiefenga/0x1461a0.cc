import { useEffect } from "react";
import {
  AlertCircle,
  FileText,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Upload,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { useCms } from "@renderer/hooks/use-cms";

export const PopoverPanel = () => {
  const {
    entities,
    pendingCount,
    snapshot,
    loading,
    publishing,
    error,
    refresh,
    publish,
  } = useCms();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handlePublish = async (): Promise<void> => {
    if (
      window.confirm(
        `Publish ${pendingCount} pending change${pendingCount === 1 ? "" : "s"}?`
      )
    ) {
      await publish();
    }
  };

  const healthy = snapshot.validation.valid && !error;
  const statusColor = !healthy
    ? "bg-red-500"
    : pendingCount > 0
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-sm font-semibold tracking-tight">0xmd</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          LOCAL → GIT
        </span>
      </div>

      <div className="mx-4 border-t" />

      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <span
            className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${statusColor}`}
          />
          {loading
            ? "Inspecting workspace…"
            : `${entities.length} posts · ${pendingCount} pending`}
        </p>
        {!healthy && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-destructive">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            {error ??
              `${snapshot.validation.errors.length} validation error(s)`}
          </p>
        )}
      </div>

      <div className="mx-4 border-t" />

      <div className="py-1">
        <PopoverItem
          icon={
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          }
          label={loading ? "Inspecting…" : "Scan & inspect"}
          disabled={loading || publishing}
          onClick={refresh}
        />
        <PopoverItem
          icon={<Upload className={publishing ? "animate-pulse" : ""} />}
          label={publishing ? "Publishing…" : `Publish (${pendingCount})`}
          disabled={
            loading ||
            publishing ||
            pendingCount === 0 ||
            !snapshot.validation.valid
          }
          onClick={handlePublish}
        />
      </div>

      <div className="mx-4 border-t" />

      <div className="py-1">
        <PopoverItem
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Open workspace"
          onClick={() => window.cmsApi.openDashboard()}
        />
      </div>

      <div className="mx-4 border-t" />

      <div className="flex-1 overflow-auto px-4 py-2">
        {entities.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-5 text-muted-foreground">
            <FileText className="mb-2 h-7 w-7" />
            <p className="text-xs">No Markdown files</p>
          </div>
        )}
        <div className="space-y-1.5">
          {entities.slice(0, 4).map((entity) => (
            <div
              key={entity.id}
              className="rounded-md px-2.5 py-2 transition-colors hover:bg-accent"
            >
              <p className="truncate text-xs font-medium">
                {entity.metadata.title}
              </p>
              <div className="mt-1 flex gap-1">
                {entity.metadata.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 border-t" />

      <div className="py-1">
        <PopoverItem
          icon={<LogOut className="h-4 w-4" />}
          label="Quit"
          onClick={() => window.cmsApi.quit()}
        />
      </div>
    </div>
  );
};

const PopoverItem = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
