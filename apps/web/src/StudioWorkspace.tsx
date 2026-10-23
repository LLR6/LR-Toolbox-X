import { isVisualStudio, type LegacyStudioId, type StudioId } from "./studios.ts";
import { StudioWorkspace as LegacyStudioWorkspace } from "./LegacyStudioWorkspace.tsx";
import { VisualStudioWorkspace } from "./VisualStudioWorkspace.tsx";

type Props = {
  id: Exclude<StudioId, "sql">;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
};

export function StudioWorkspace(props: Props) {
  if (isVisualStudio(props.id)) {
    return <VisualStudioWorkspace {...props} id={props.id} />;
  }
  return (
    <LegacyStudioWorkspace
      {...props}
      id={props.id as LegacyStudioId}
    />
  );
}
