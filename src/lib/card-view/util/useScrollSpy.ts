import { useEffect, useRef } from "react";
import {
  parseSectionDomId,
  sectionsEqual,
  type ActiveSection,
} from "../activeSection";

const TOP_VIEWPORT_MARGIN = "-20% 0px -60% 0px";

export function useScrollSpy(
  sectionIds: string[],
  current: ActiveSection,
  onChange: (next: ActiveSection) => void,
) {
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topmostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (!topmostVisible) return;

        const next = parseSectionDomId(topmostVisible.target.id);
        if (next && !sectionsEqual(next, currentRef.current)) onChange(next);
      },
      { rootMargin: TOP_VIEWPORT_MARGIN, threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionIds, onChange]);
}
