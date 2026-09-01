// Client module: silence the benign "ResizeObserver loop" browser notice.
//
// Monaco and ui-components' SplitPane (react-resizable-panels) both use
// ResizeObserver. When they mount/resize — e.g. navigating to or from the
// Playground in Docusaurus' SPA — the browser occasionally fires the
// "ResizeObserver loop completed with undelivered notifications." notice.
//
// This is NOT an error: the ResizeObserver spec says the browser simply had
// more resize callbacks than it could deliver in one frame and deferred the
// rest to the next frame. No layout is wrong and nothing is stuck in a loop.
// The message reaches `window` as a global `error` event, and
// webpack-dev-server's dev overlay listens for those and renders a full-screen
// "Uncaught runtime errors" box — purely a dev-time annoyance (there is no
// overlay in production builds).
//
// We drop this one specific message before the overlay reacts, and hide the
// overlay if it managed to render first. All other errors pass through
// untouched.

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

// The dev overlay only exists in development; skip the listener entirely in
// production so nothing extra ships to users.
if (ExecutionEnvironment.canUseDOM && process.env.NODE_ENV !== "production") {
  const BENIGN_MESSAGES = [
    "ResizeObserver loop completed with undelivered notifications.",
    "ResizeObserver loop limit exceeded",
  ];

  const isBenign = (message?: string): boolean =>
    !!message && BENIGN_MESSAGES.some((m) => message.includes(m));

  const hideDevServerOverlay = (): void => {
    // webpack-dev-server renders the overlay into a host element with this id
    // (its content lives in a shadow root, so hiding the host hides all of it).
    const overlay = document.getElementById(
      "webpack-dev-server-client-overlay",
    );
    if (overlay) overlay.style.display = "none";
  };

  window.addEventListener(
    "error",
    (event: ErrorEvent) => {
      if (!isBenign(event.message)) return;
      // Best effort: if our listener runs before the overlay's, this stops it
      // from ever rendering.
      event.stopImmediatePropagation();
      event.preventDefault();
      // Fallback: if the overlay already rendered from a prior event, or ours
      // ran second, hide it on the next frame once it exists in the DOM.
      requestAnimationFrame(hideDevServerOverlay);
    },
    true, // capture phase
  );
}
