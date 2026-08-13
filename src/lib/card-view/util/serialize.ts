import { stringify as yamlStringify } from "yaml";

export function toYaml(value: unknown): string {
  try {
    return yamlStringify(value);
  } catch {
    return JSON.stringify(value, null, 2);
  }
}
