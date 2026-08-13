import type { OverlaySelector } from "../types";

export type SelectorKind =
  | "root"
  | "jsonPath"
  | "operation"
  | "parameter"
  | "returnType"
  | "entityType"
  | "complexType"
  | "enumType"
  | "propertyType"
  | "entitySet"
  | "namespace"
  | "unknown";

export interface DescribedSelector {
  kind: SelectorKind;
  value: string;
  context?: string;
}

export function describeSelector(selector: OverlaySelector): DescribedSelector {
  if (selector.root) return { kind: "root", value: "whole document" };
  if (selector.jsonPath) return { kind: "jsonPath", value: selector.jsonPath };
  if (selector.operation && selector.parameter) {
    return {
      kind: "parameter",
      value: selector.parameter,
      context: `in operation ${selector.operation}`,
    };
  }
  if (selector.operation && selector.returnType) {
    return {
      kind: "returnType",
      value: "return type",
      context: `of operation ${selector.operation}`,
    };
  }
  if (selector.operation)
    return { kind: "operation", value: selector.operation };
  if (selector.propertyType) {
    const parent =
      selector.entityType ?? selector.complexType ?? selector.enumType ?? "?";
    return {
      kind: "propertyType",
      value: selector.propertyType,
      context: `on ${parent}`,
    };
  }
  if (selector.entityType)
    return { kind: "entityType", value: selector.entityType };
  if (selector.complexType)
    return { kind: "complexType", value: selector.complexType };
  if (selector.enumType) return { kind: "enumType", value: selector.enumType };
  if (selector.entitySet)
    return { kind: "entitySet", value: selector.entitySet };
  if (selector.namespace)
    return { kind: "namespace", value: selector.namespace };
  return { kind: "unknown", value: JSON.stringify(selector) };
}
