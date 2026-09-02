/**
 * Safely turn an untrusted patch `action` into a display string.
 *
 * `action` is typed as `OverlayAction`, but the overlay document is parsed from
 * untrusted JSON/YAML, so at runtime it can be any value — including an object
 * such as `{ "toString": null }`, for which the built-in `String(...)` /
 * template coercion throws `Cannot convert object to primitive value`. Several
 * call sites (the sidebar, the toolbar label) render outside the per-patch
 * error boundary, so such a throw would crash the entire view.
 *
 * This formatter never invokes user-controlled coercion (`toString`/`valueOf`)
 * and never throws.
 */
export function formatAction(action: unknown): string {
  switch (typeof action) {
    case "string":
      return action;
    case "number":
    case "boolean":
    case "bigint":
      return String(action);
    case "symbol":
      // `Symbol.prototype.toString` is a built-in and cannot be overridden.
      return action.toString();
    case "undefined":
      return "";
    default:
      if (action === null) return "null";
      // Objects/arrays/functions: serialize without touching `toString`/
      // `valueOf`. `JSON.stringify` can still throw (circular refs, a throwing
      // `toJSON`), so guard it.
      try {
        return JSON.stringify(action) ?? "";
      } catch {
        return "[unrenderable action]";
      }
  }
}
