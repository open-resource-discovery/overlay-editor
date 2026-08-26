// Ambient declarations for side-effect imports in the library source.
// These previously came from Next.js' generated `next-env.d.ts`; now that the
// demo is a separate Docusaurus site, the library declares them itself so both
// `tsc --noEmit` (typecheck) and the `vite-plugin-dts` declaration build resolve
// the CSS side-effect imports. Living under `src/lib/**` means it is included by
// `tsconfig.lib.json`.
declare module "*.css";
declare module "@open-resource-discovery/ui-components/styles";
