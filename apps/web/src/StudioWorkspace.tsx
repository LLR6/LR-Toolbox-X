import { CyberChefWorkspace } from "./CyberChefWorkspace.tsx";
import { ResearchWorkspace } from "./ResearchWorkspace.tsx";
import {
  isVisualStudio,
  type LegacyStudioId,
  type StudioId,
} from "./studios.ts";
import { StudioWorkspace as LegacyStudioWorkspace } from "./LegacyStudioWorkspace.tsx";
import { VisualStudioWorkspace } from "./VisualStudioWorkspace.tsx";

type Props = {
  id: Exclude<StudioId, "sql">;
  en: boolean;
  onClose: () => void;
  onOpen: (id: Exclude<StudioId, "sql">) => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
};

export function StudioWorkspace(props: Props) {
  if (props.id === "cyberchef") return <CyberChefWorkspace {...props} />;
  if (
    props.id === "resources" ||
    props.id === "qrread" ||
    props.id === "calendar"
  ) {
    return <ResearchWorkspace {...props} id={props.id} onOpen={props.onOpen} />;
  }
  if (isVisualStudio(props.id)) {
    return <VisualStudioWorkspace {...props} id={props.id} />;
  }
  return <LegacyStudioWorkspace {...props} id={props.id as LegacyStudioId} />;
}
