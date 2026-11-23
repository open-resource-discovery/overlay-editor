import { type ActiveSection, sectionDomId } from "../activeSection";

export function scrollToSection(section: ActiveSection): boolean {
  const target = document.getElementById(sectionDomId(section));
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
