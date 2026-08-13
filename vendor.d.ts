// Ambient module declarations for CSS-only subpaths of dependencies.
// TS 6 requires a type declaration for every module we import, even
// side-effect-only ones. These packages ship `./styles` as raw CSS with
// no accompanying `.d.ts`; declaring them as empty modules is the
// standard workaround.
declare module "@open-resource-discovery/ui-components/styles";
