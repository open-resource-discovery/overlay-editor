import { useEffect, type RefObject } from "react";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPad|iPhone|iPod/.test(navigator.platform);

export const SEARCH_HOTKEY_LABEL = isMac ? "⌘ K" : "^ K";

function isFocusSearchShortcut(event: KeyboardEvent): boolean {
  const modifier = isMac ? event.metaKey : event.ctrlKey;
  return modifier && (event.key === "k" || event.key === "K");
}

function isEscape(event: KeyboardEvent): boolean {
  return event.key === "Escape";
}

export function useSearchHotkeys(
  inputRef: RefObject<HTMLInputElement | null>,
  onClear: () => void,
) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (isFocusSearchShortcut(event)) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (isEscape(event) && document.activeElement === inputRef.current) {
        onClear();
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [inputRef, onClear]);
}
