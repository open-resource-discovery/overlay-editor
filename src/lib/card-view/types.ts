export type OverlayAction = "update" | "merge" | "remove";
export type OverlayVisibility = "public" | "internal" | "private";
export type OverlayPerspective =
  "system-type" | "system-version" | "system-instance";

export interface OverlaySelector {
  root?: true;
  jsonPath?: string;
  operation?: string;
  entityType?: string;
  complexType?: string;
  enumType?: string;
  propertyType?: string;
  entitySet?: string;
  namespace?: string;
  parameter?: string;
  returnType?: true;
}

export interface OverlayPatch {
  action: OverlayAction;
  selector: OverlaySelector;
  data?: unknown;
  description?: string;
  tags?: string[];
}

export interface OverlayTarget {
  ordId?: string;
  url?: string;
  correlationIds?: string[];
  definitionType?: string;
}

export interface OrdOverlay {
  ordOverlay: string;
  ordId?: string;
  description?: string;
  visibility?: OverlayVisibility;
  perspective?: OverlayPerspective;
  target?: OverlayTarget;
  patches?: OverlayPatch[];
}

export const OVERLAY_SPEC_URL =
  "https://github.com/open-resource-discovery/specification/blob/main/spec/v1/OrdOverlay.schema.yaml";
