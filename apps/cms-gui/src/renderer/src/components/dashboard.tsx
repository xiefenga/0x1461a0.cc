import { useEffect, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  FileText,
  RefreshCw,
  Save,
  Upload,
} from "lucide-react";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { useCms } from "@renderer/hooks/use-cms";

export const Dashboard = () => {
  const {
    entities,
    pendingCount,
    snapshot,
    loading,
    publishing,
    error,
    lastPublish,
    refresh,
    publish,
    updateMetadata,
  } = useCms();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handlePublish = async (): Promise<void> => {
    if (
      window.confirm(
        `Publish ${pendingCount} pending change${pendingCount === 1 ? "" : "s"} to Git?`
      )
    ) {
      await publish();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div
        className="h-12 shrink-0"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />

      <div className="flex-1 overflow-auto px-6 pb-8">
        <header className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Pure Markdown / External metadata / Git delivery
            </p>
            <h1 className="text-2xl font-bold tracking-tight">0xmd workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {entities.length} files · {pendingCount} pending changes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refresh}
              disabled={loading || publishing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Inspecting…" : "Inspect"}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={
                loading ||
                publishing ||
                pendingCount === 0 ||
                !snapshot.validation.valid
              }
              size="sm"
            >
              <Upload className={publishing ? "animate-pulse" : ""} />
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </header>

        {(error || !snapshot.validation.valid) && (
          <Card className="mb-5 border-destructive/50 bg-destructive/5">
            <CardContent className="flex gap-3 pt-6">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="space-y-1 text-sm text-destructive">
                {error && <p>{error}</p>}
                {snapshot.validation.errors.map((validationError) => (
                  <p key={`${validationError.entityId}:${validationError.field}`}>
                    {validationError.entityId} · {validationError.field}:{" "}
                    {validationError.message}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {lastPublish?.success && (
          <p className="mb-5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700">
            Published {lastPublish.published} and removed {lastPublish.removed}
            {lastPublish.commitHash
              ? ` · ${lastPublish.commitHash.slice(0, 8)}`
              : ""}
          </p>
        )}

        <section className="mb-6 grid grid-cols-4 gap-3">
          <Metric label="Added" value={snapshot.changeSet.added.length} tone="+" />
          <Metric
            label="Updated"
            value={snapshot.changeSet.updated.length}
            tone="~"
          />
          <Metric
            label="Removed"
            value={snapshot.changeSet.removed.length}
            tone="−"
          />
          <Metric
            label="Validation"
            value={snapshot.validation.errors.length}
            tone={snapshot.validation.valid ? "✓" : "!"}
          />
        </section>

        {!loading && !error && entities.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No Markdown files match the configured patterns.
              </p>
            </CardContent>
          </Card>
        )}

        <section className="space-y-3">
          {entities.map((entity) => (
            <MetadataCard
              key={`${entity.id}:${entity.hash}`}
              entity={entity}
              disabled={loading || publishing}
              onSave={updateMetadata}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) => {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{tone}</span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
};

const MetadataCard = ({
  entity,
  disabled,
  onSave,
}: {
  entity: ContentEntityDTO;
  disabled: boolean;
  onSave: (path: string, patch: MetadataPatchDTO) => Promise<void>;
}) => {
  const [title, setTitle] = useState(entity.metadata.title);
  const [slug, setSlug] = useState(entity.metadata.slug);
  const [tags, setTags] = useState(entity.metadata.tags.join(", "));
  const [description, setDescription] = useState(entity.metadata.description);

  const save = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    await onSave(entity.path, {
      title,
      slug,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      description,
    });
  };

  return (
    <Card>
      <form onSubmit={save}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{entity.metadata.title}</CardTitle>
              <CardDescription className="mt-1 font-mono text-xs">
                {entity.path}
              </CardDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {entity.metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Slug" value={slug} onChange={setSlug} mono />
            <Field label="Tags" value={tags} onChange={setTags} />
            <Field
              label="Description"
              value={description}
              onChange={setDescription}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted-foreground">
              UPDATED {entity.metadata.updated}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => window.cmsApi.openContentFile(entity.path)}
              >
                <ExternalLink />
                Open Markdown
              </Button>
              <Button type="submit" size="sm" disabled={disabled}>
                <Save />
                Save metadata
              </Button>
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

const Field = ({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) => {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
};
