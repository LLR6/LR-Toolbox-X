import { LegacyStudioWorkspace } from "./LegacyStudioWorkspace.tsx";
import { VisualStudioWorkspace } from "./VisualStudioWorkspace.tsx";
import {
  legacyStudioIds,
  visualStudioIds,
  type StudioId,
  type LegacyStudioId,
  type VisualStudioId,
} from "./studios.ts";

export function StudioWorkspace({
  id,
  en,
  onClose,
  onRecord,
}: {
  id: Exclude<StudioId, "sql">;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
}) {
  if (visualStudioIds.includes(id as VisualStudioId)) {
    return (
      <VisualStudioWorkspace
        id={id as VisualStudioId}
        en={en}
        onClose={onClose}
        onRecord={onRecord}
      />
    );
  }
  if (legacyStudioIds.includes(id as LegacyStudioId)) {
    return (
      <LegacyStudioWorkspace
        id={id as LegacyStudioId}
        en={en}
        onClose={onClose}
        onRecord={onRecord}
      />
    );
  }
  return null;
}
