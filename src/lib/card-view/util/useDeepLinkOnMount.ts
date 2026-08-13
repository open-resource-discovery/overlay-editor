import { useEffect } from "react";
import { parseSectionDomId, type ActiveSection } from "../activeSection";
import { scrollToSection } from "./scrollToSection";

export function useDeepLinkOnMount(
  onSectionResolved: (section: ActiveSection) => void,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHash = window.location.hash.replace(/^#/, "");
    if (!initialHash) return;

    const section = parseSectionDomId(initialHash);
    if (!section) return;

    // Defer until layout settles so the target node exists and offsets are accurate.
    const animationFrame = requestAnimationFrame(() => {
      if (scrollToSection(section)) onSectionResolved(section);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [onSectionResolved]);
}
