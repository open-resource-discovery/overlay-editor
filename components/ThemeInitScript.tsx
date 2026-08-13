// Inlined before hydration so `.dark` is set on <html> before paint,
// preventing a flash-of-light-theme. Reads the same localStorage key
// `@open-resource-discovery/ui-components` writes to (`ord-ui-theme`),
// and falls back to `prefers-color-scheme`.
const themeInitScript = `(function(){try{var t=localStorage.getItem("ord-ui-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export function ThemeInitScript() {
  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
