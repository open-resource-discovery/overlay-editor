import { useEffect } from "react";
import { sectionDomId, type ActiveSection } from "../activeSection";

export function useHashSync(section: ActiveSection) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desiredHash = `#${sectionDomId(section)}`;
    if (window.location.hash !== desiredHash) {
      history.replaceState(null, "", desiredHash);
    }
  }, [section]);
}
