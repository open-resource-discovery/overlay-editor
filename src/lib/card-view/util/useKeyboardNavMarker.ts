import { useEffect } from "react";

const KEYBOARD_NAV_CLASS = "navigation-with-keyboard";

export function useKeyboardNavMarker() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const markKeyboardNav = (e: KeyboardEvent) => {
      if (e.key === "Tab") document.body.classList.add(KEYBOARD_NAV_CLASS);
    };
    const clearKeyboardNav = () =>
      document.body.classList.remove(KEYBOARD_NAV_CLASS);

    window.addEventListener("keydown", markKeyboardNav);
    window.addEventListener("mousedown", clearKeyboardNav);
    return () => {
      window.removeEventListener("keydown", markKeyboardNav);
      window.removeEventListener("mousedown", clearKeyboardNav);
    };
  }, []);
}
