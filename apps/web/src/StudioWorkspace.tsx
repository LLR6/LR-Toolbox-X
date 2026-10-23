import {
  isDataUtilityStudio,
  isPowerStudio,
  isVisualStudio,
  type LegacyStudioId,
  type StudioId,
} from "./studios.ts";
import { StudioWorkspace as LegacyStudioWorkspace } from "./LegacyStudioWorkspace.tsx";
import { VisualStudioWorkspace } from "./VisualStudioWorkspace.tsx";
import { PowerStudioWorkspace } from "./PowerStudioEntry.tsx";
import { DataUtilityStudioWorkspace } from "./DataUtilityStudioWorkspace.tsx";

type Props = {
  id: Exclude<StudioId, "sql">;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
};

export function StudioWorkspace(props: Props) {
  if (isDataUtilityStudio(props.id)) {
    return <DataUtilityStudioWorkspace {...props} id={props.id} />;
  }
  if (isPowerStudio(props.id)) {
    return <PowerStudioWorkspace {...props} id={props.id} />;
  }
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
