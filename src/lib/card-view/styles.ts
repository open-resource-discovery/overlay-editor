const overlayLayoutStyles = `
/* ============================================================================
 * Overlay-specific tokens only.
 * Everything else (--ord-background / -foreground / -muted / -border / -card /
 * -primary / -success / -warning / -destructive / -radius / -font-*)
 * is provided by @open-resource-discovery/ui-components' ThemeRoot and is
 * automatically swapped between light and dark themes by useTheme().
 * ============================================================================ */
@layer base {
    :where(.overlay-card-view) {
        --overlay-sidebar-footer-height: 35px;
        height: 100%;
        min-height: 0;
    }
}

.overlay-root {
    /* accent — Scalar's display-p3 blue, used for active sidebar items + hits */
    --overlay-accent: #0099ff;
    --overlay-accent-bg: color-mix(in oklab, var(--overlay-accent) 12%, transparent);

    /* verb colors for action / method indicators */
    --overlay-action-update: #c97a17;
    --overlay-action-merge: #0b9061;
    --overlay-action-remove: #dc2626;
    --overlay-action-default: #0a6ed1;

    /* layout */
    --overlay-toolbar-height: 48px;
    --overlay-sidebar-width: 280px;

    color: var(--ord-foreground);
    background: var(--ord-background);
    height: 100%;
    min-height: 0;

    /* container queries target this element via @container overlay-root (...) */
    container-type: inline-size;
    container-name: overlay-root;
}

#overview, #target, [id^="patch-"] {
    scroll-margin-top: calc(var(--overlay-toolbar-height) + 16px);
}

/* ============================================================================
 * Shell — Scalar's grid: sidebar + main. Container queries on .overlay-root
 * drive the breakpoints (so layout responds to renderer width, not viewport).
 * ============================================================================ */
.overlay-shell {
    display: grid;
    grid-template-areas:
        "toolbar"
        "sidebar"
        "content";
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    min-height: 100%;
    background: var(--ord-background);
}

/* ============================================================================
 * Sidebar — search / navigation / footer
 * ============================================================================ */
.overlay-sidebar {
    grid-area: sidebar;
    background: var(--ord-background);
    border-right: 1px solid var(--ord-border);
}
.overlay-sidebar-inner {
    position: static;
    height: auto;
    display: flex;
    flex-direction: column;
    overflow: visible;
}
.overlay-sidebar-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--ord-border);
    flex-shrink: 0;
}
.overlay-sidebar-search {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}
.overlay-sidebar-search-icon {
    position: absolute;
    left: 10px;
    color: var(--ord-muted-foreground);
    pointer-events: none;
}
.overlay-sidebar-search-input {
    padding-left: 26px;
    padding-right: 56px;
    height: 31px;
    font-size: 13px;
    border-radius: 6px;
    width: 100%;
}
.overlay-sidebar-kbd {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--ord-font-mono, 'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Cascadia Code', monospace);
    font-size: 10px;
    text-transform: uppercase;
    line-height: 1;
    color: var(--ord-muted-foreground);
    background: var(--ord-muted);
    border-radius: 4px;
    padding: 4px 5px;
    pointer-events: none;
}
.overlay-sidebar-nav {
    flex: none;
    overflow-y: visible;
    padding: 6px 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.overlay-sidebar-footer {
    flex-shrink: 0;
    border-top: 1px solid var(--ord-border);
    background: var(--ord-background);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--ord-muted-foreground);
}
.overlay-sidebar-footer-mobile {
    position: fixed;
    bottom: 0;
    z-index: 20;
    display: flex;
    height: var(--overlay-sidebar-footer-height);
    box-sizing: border-box;
}
.overlay-sidebar-footer a {
    color: var(--ord-muted-foreground);
    text-decoration: none;
}
.overlay-sidebar-footer a:hover {
    color: var(--ord-foreground);
}
.overlay-sidebar-footer-spacer { flex: 1; }

.overlay-sidebar-group { display: flex; flex-direction: column; gap: 2px; }
.overlay-sidebar-group + .overlay-sidebar-group {
    border-top: 1px solid var(--ord-border);
    margin-top: 8px;
    padding-top: 8px;
}
.overlay-sidebar-group-title {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
    font-weight: 600;
    color: var(--ord-muted-foreground);
    padding: 6px 8px 4px;
    margin: 0;
}
.overlay-sidebar-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1px; }
.overlay-sidebar-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 14px;
    color: var(--ord-muted-foreground);
    text-decoration: none;
    font-weight: 400;
    line-height: 1.385;
}
.overlay-sidebar-item:hover { background: var(--ord-muted); color: var(--ord-foreground); }
.overlay-sidebar-item-active {
    color: var(--overlay-accent);
    font-weight: 500;
    background: var(--overlay-accent-bg);
}
.overlay-sidebar-item-active .overlay-sidebar-item-label {
    color: var(--overlay-accent);
}
.overlay-sidebar-item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--ord-font-mono, 'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Cascadia Code', monospace);
    font-size: 13px;
}
.overlay-sidebar-method {
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
    text-transform: uppercase;
    min-width: 50px;
    font-family: var(--ord-font-mono, 'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Cascadia Code', monospace);
    text-align: right;
}
.overlay-sidebar-method-default { color: var(--overlay-action-default); }
.overlay-sidebar-method-success { color: var(--overlay-action-merge); }
.overlay-sidebar-method-destructive { color: var(--overlay-action-remove); }
.overlay-sidebar-hit {
    background: var(--overlay-accent-bg);
    color: inherit;
    padding: 0;
    border-radius: 2px;
}
.overlay-sidebar-empty {
    padding: 16px 12px;
    font-size: 12px;
    color: var(--ord-muted-foreground);
    text-align: center;
}

/* ============================================================================
 * Main column
 * ============================================================================ */
.overlay-toolbar {
    grid-area: toolbar;
    position: sticky;
    top: 0;
    z-index: 10;
    height: var(--overlay-toolbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid var(--ord-border);
    background: var(--ord-background);
    gap: 8px;
}
.overlay-toolbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.overlay-toolbar-section {
    font-size: 13px;
    font-weight: 500;
    color: var(--ord-foreground);
    font-family: var(--ord-font-mono, 'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Cascadia Code', monospace);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    transition: opacity 120ms ease;
}
.overlay-toolbar-actions { display: flex; align-items: center; gap: 4px; }
.overlay-toolbar-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--ord-foreground);
    text-decoration: none;
}
.overlay-toolbar-link:hover { background: var(--ord-muted); }

.overlay-main-content {
    grid-area: content;
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-bottom: 0;
}

@container overlay-root (min-width: 720px) {
    .overlay-shell {
        height: 100%;
        min-height: 0;
        grid-template-areas:
            "sidebar toolbar"
            "sidebar content";
        grid-template-columns: var(--overlay-sidebar-width) minmax(0, 1fr);
        grid-template-rows: var(--overlay-toolbar-height) minmax(0, 1fr);
    }
    .overlay-sidebar {
        min-height: 0;
    }
    .overlay-sidebar-inner {
        position: sticky;
        top: 0;
        height: 100%;
        overflow: hidden;
    }
    .overlay-sidebar-nav {
        flex: 1;
        overflow-y: auto;
    }
    .overlay-main-content {
        min-height: 0;
        overflow-y: auto;
    }
}

/* Each top-level block (hero / target / patches) is wrapped in this section. */
.overlay-section {
    padding: 48px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* ============================================================================
 * Hero — two-column (left description / right sticky cards)
 * ============================================================================ */
.overlay-hero { gap: 48px; }
.overlay-hero-badges { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.overlay-hero-title {
    font-size: 24px;
    line-height: 1.45;
    font-weight: 600;
    margin: 12px 0 0;
    color: var(--ord-foreground);
    font-family: var(--ord-font-mono, 'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Cascadia Code', monospace);
    word-break: break-word;
}
.overlay-hero-eyebrow {
    color: var(--ord-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
    font-weight: 600;
    margin: 0;
}
.overlay-hero-columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
}
.overlay-hero-description {
    font-size: 16px;
    line-height: 1.625;
    color: var(--ord-foreground);
}
.overlay-hero-description :where(p) { margin: 0 0 12px 0; }
.overlay-hero-description :where(p:last-child) { margin-bottom: 0; }
.overlay-hero-description :where(a),
.overlay-patch-body :where(a) {
    color: var(--ord-foreground);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-thickness: 1px;
}
.overlay-hero-description :where(a):hover,
.overlay-patch-body :where(a):hover {
    color: var(--overlay-accent);
}

.overlay-hero-side {
    display: flex;
    flex-direction: column;
}
.overlay-hero-side > * + * {
    border-top: 0;
    margin-top: -1px; /* fuse cards like Scalar's introduction-card */
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}
.overlay-hero-side > *:not(:last-child) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

@media (min-width: 1000px) {
    /* fallback for browsers without container query support */
}

/* ============================================================================
 * Target card (Scalar info-card style)
 * ============================================================================ */
.overlay-target-card {
    background: var(--ord-card);
    border: 1px solid var(--ord-border);
    border-radius: var(--ord-radius);
}
.overlay-target-rows { display: flex; flex-direction: column; gap: 8px; }
.overlay-target-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    align-items: baseline;
    gap: 12px;
}
.overlay-target-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
    font-weight: 600;
    color: var(--ord-muted-foreground);
}
.overlay-target-value { min-width: 0; word-break: break-word; font-size: 14px; }

/* ============================================================================
 * Section header (Patches title row)
 * ============================================================================ */
.overlay-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.overlay-section-header-left { display: flex; align-items: center; gap: 8px; }
.overlay-section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
}

/* ============================================================================
 * Patches summary card (Scalar endpoints-card preview)
 * ============================================================================ */
.overlay-patch-summary {
    border: 1px solid var(--ord-border);
    border-radius: var(--ord-radius);
    background: var(--ord-background);
    overflow: hidden;
}
.overlay-patch-summary-header {
    padding: 10px 14px;
    background: var(--ord-muted);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ord-muted-foreground);
    border-bottom: 1px solid var(--ord-border);
}
.overlay-patch-summary ul { list-style: none; padding: 0; margin: 0; }
.overlay-patch-summary li + li { border-top: 1px solid var(--ord-border); }
.overlay-patch-summary a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    text-decoration: none;
    color: var(--ord-foreground);
}
.overlay-patch-summary a:hover { background: var(--ord-muted); }

/* ============================================================================
 * Patches list — Scalar operations
 * ============================================================================ */
.overlay-patch-list { display: flex; flex-direction: column; gap: 12px; }
.overlay-patch-anchor {
    scroll-margin-top: calc(var(--overlay-toolbar-height) + 16px);
}
.overlay-patch { background: var(--ord-background); }
.overlay-patch-trigger { display: flex; width: 100%; }
.overlay-patch-label { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; text-align: left; }
.overlay-patch-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 16px;
}
.overlay-patch-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.overlay-field { display: flex; flex-direction: column; gap: 6px; }
.overlay-field-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.overlay-field-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
    font-weight: 600;
    color: var(--ord-muted-foreground);
    margin: 0;
}

.overlay-callout {
    padding: 12px 14px;
    border: 1px solid var(--ord-border);
    border-radius: var(--ord-radius);
    font-size: 13px;
    color: var(--ord-muted-foreground);
    background: var(--ord-card);
}
.overlay-callout-destructive {
    border-left: 4px solid var(--ord-destructive);
    background: rgba(220, 38, 38, 0.06);
    color: var(--ord-foreground);
}

.overlay-selector { font-size: 13px; }
.overlay-selector-value { font-family: var(--ord-font-mono, 'JetBrains Mono', ui-monospace, Menlo, Monaco, 'Cascadia Code', monospace); }

.overlay-fatal {
    padding: 32px;
    color: var(--ord-foreground);
    font-family: var(--ord-font-sans, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif);
}
.overlay-fatal h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 600; }
.overlay-fatal p { margin: 0; color: var(--ord-muted-foreground); }

/* ============================================================================
 * Focus ring (keyboard-only)
 * ============================================================================ */
.overlay-root :focus { outline: none; }
body.navigation-with-keyboard .overlay-root :focus-visible {
    outline: 1px solid var(--overlay-accent);
    outline-offset: -2px;
    border-radius: inherit;
}

/* ============================================================================
 * Mobile — drawer instead of display:none
 * ============================================================================ */
/* Hero two-column at wide container */
@container overlay-root (min-width: 900px) {
    .overlay-hero-columns {
        grid-template-columns: minmax(0, 1fr) 320px;
    }
    .overlay-hero-side {
        position: sticky;
        top: calc(var(--overlay-toolbar-height) + 16px);
        align-self: start;
    }
}

@container overlay-root (min-width: 1000px) {
    .overlay-patch-body {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
}

/* Narrow container — tighten section padding so content doesn't crowd edges. */
@container overlay-root (width < 720px) {
    .overlay-section { padding: 32px 16px; }
    .overlay-sidebar-footer-desktop { display: none; }
    .overlay-main-content {
        padding-bottom: var(--overlay-sidebar-footer-height);
    }
}
`;

export default overlayLayoutStyles;
