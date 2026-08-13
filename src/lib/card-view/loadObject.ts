import { parse as parseYaml } from "yaml";

// Loose JSON-or-YAML object loader. Returns `undefined` on parse failure
// so callers can render a fatal-state UI instead of crashing.
//
// Sourced from `metadata-renderer/src/lib/core/utils.ts` (`loadObject`) —
// kept local to the View module so this package has no implicit dependency
// on the host renderer.
export function loadObject(content: string): undefined | object {
  if (!content) return;

  let object: unknown;
  if (content.charAt(0) === "{") {
    try {
      object = JSON.parse(content);
    } catch (e) {
      console.error(e);
      return;
    }
  } else {
    try {
      object = parseYaml(content);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  if (!object || typeof object !== "object") {
    return;
  }

  return object;
}
