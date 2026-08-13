import type { BadgeProps } from "@open-resource-discovery/ui-components";
import type { OverlayAction, OverlayVisibility } from "../types";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

export function actionVariant(action: OverlayAction): BadgeVariant {
  switch (action) {
    case "update":
      return "default";
    case "merge":
      return "success";
    case "remove":
      return "destructive";
  }
}

export function visibilityVariant(visibility: OverlayVisibility): BadgeVariant {
  switch (visibility) {
    case "public":
      return "success";
    case "internal":
      return "warning";
    case "private":
      return "destructive";
  }
}
