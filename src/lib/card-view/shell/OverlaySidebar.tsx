import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { Input, cn } from "@open-resource-discovery/ui-components";
import { Search } from "lucide-react";
import {
  OVERVIEW,
  TARGET,
  patchAt,
  sectionDomId,
  sectionsEqual,
  type ActiveSection,
} from "../activeSection";
import { describeSelector } from "../util/describeSelector";
import { actionVariant } from "../util/badgeVariants";
import { formatAction } from "../util/formatAction";
import { scrollToSection } from "../util/scrollToSection";
import { useScrollSpy } from "../util/useScrollSpy";
import { useHashSync } from "../util/useHashSync";
import {
  useSearchHotkeys,
  SEARCH_HOTKEY_LABEL,
} from "../util/useSearchHotkeys";
import type { OrdOverlay, OverlayAction } from "../types";

type Entry = {
  section: ActiveSection;
  primary: string;
  secondary?: string;
  action?: OverlayAction;
};

type Props = {
  overlay: OrdOverlay;
  activeSection: ActiveSection;
  onSectionChange: (next: ActiveSection) => void;
  scrollRootRef: RefObject<HTMLElement | null>;
  useScrollRoot: boolean;
};

function buildEntries(overlay: OrdOverlay): {
  meta: Entry[];
  patches: Entry[];
} {
  const meta: Entry[] = [{ section: OVERVIEW, primary: "Overview" }];
  if (overlay.target) meta.push({ section: TARGET, primary: "Target" });

  const patches: Entry[] = (overlay.patches ?? []).map((patch, index) => {
    const described = describeSelector(patch.selector);
    return {
      section: patchAt(index),
      primary: described.value,
      secondary: described.kind,
      action: patch.action,
    };
  });

  return { meta, patches };
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const matchStart = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchStart === -1) return text;
  const matchEnd = matchStart + query.length;
  return (
    <>
      {text.slice(0, matchStart)}
      <mark className="overlay-sidebar-hit">
        {text.slice(matchStart, matchEnd)}
      </mark>
      {text.slice(matchEnd)}
    </>
  );
}

function entryMatchesQuery(entry: Entry, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return (
    entry.primary.toLowerCase().includes(normalizedQuery) ||
    entry.secondary?.toLowerCase().includes(normalizedQuery) === true ||
    (entry.action !== undefined &&
      formatAction(entry.action).includes(normalizedQuery))
  );
}

export function OverlaySidebar({
  overlay,
  activeSection,
  onSectionChange,
  scrollRootRef,
  useScrollRoot,
}: Props) {
  const { meta, patches } = useMemo(() => buildEntries(overlay), [overlay]);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = useCallback(() => setQuery(""), []);
  useSearchHotkeys(searchInputRef, clearSearch);

  const allSectionIds = useMemo(
    () => [...meta, ...patches].map((entry) => sectionDomId(entry.section)),
    [meta, patches],
  );
  useScrollSpy(
    allSectionIds,
    activeSection,
    onSectionChange,
    scrollRootRef,
    useScrollRoot,
  );
  useHashSync(activeSection);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleMeta = meta.filter((entry) =>
    entryMatchesQuery(entry, normalizedQuery),
  );
  const visiblePatches = patches.filter((entry) =>
    entryMatchesQuery(entry, normalizedQuery),
  );
  const hasNoMatches =
    normalizedQuery !== "" &&
    visibleMeta.length === 0 &&
    visiblePatches.length === 0;

  const handleAnchorClick = useCallback(
    (section: ActiveSection) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!scrollToSection(section)) return;
      e.preventDefault();
      onSectionChange(section);
    },
    [onSectionChange],
  );

  return (
    <aside className="overlay-sidebar">
      <div className="overlay-sidebar-inner">
        <div className="overlay-sidebar-header">
          <div className="overlay-sidebar-search">
            <Search
              size={14}
              aria-hidden
              className="overlay-sidebar-search-icon"
            />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="overlay-sidebar-search-input"
              aria-label="Search overlay"
            />
            <kbd className="overlay-sidebar-kbd">{SEARCH_HOTKEY_LABEL}</kbd>
          </div>
        </div>

        <nav aria-label="Overlay navigation" className="overlay-sidebar-nav">
          {visibleMeta.length > 0 ? (
            <ul className="overlay-sidebar-list">
              {visibleMeta.map((entry) => (
                <SidebarLink
                  key={sectionDomId(entry.section)}
                  entry={entry}
                  isActive={sectionsEqual(entry.section, activeSection)}
                  query={query}
                  onClick={handleAnchorClick(entry.section)}
                  plain
                />
              ))}
            </ul>
          ) : null}

          {visiblePatches.length > 0 ? (
            <div className="overlay-sidebar-group">
              <p className="overlay-sidebar-group-title">Patches</p>
              <ul className="overlay-sidebar-list">
                {visiblePatches.map((entry) => (
                  <SidebarLink
                    key={sectionDomId(entry.section)}
                    entry={entry}
                    isActive={sectionsEqual(entry.section, activeSection)}
                    query={query}
                    onClick={handleAnchorClick(entry.section)}
                  />
                ))}
              </ul>
            </div>
          ) : null}

          {hasNoMatches ? (
            <div className="overlay-sidebar-empty">
              No matches for &ldquo;{query}&rdquo;
            </div>
          ) : null}
        </nav>

        <OverlaySidebarFooter
          ordOverlay={overlay.ordOverlay}
          className="overlay-sidebar-footer-desktop"
        />
      </div>
    </aside>
  );
}

type FooterProps = {
  ordOverlay: string;
  className?: string;
  style?: CSSProperties;
};

export function OverlaySidebarFooter({
  ordOverlay,
  className,
  style,
}: FooterProps) {
  return (
    <footer className={cn("overlay-sidebar-footer", className)} style={style}>
      <span>ORD Overlay {ordOverlay}</span>
      <span aria-hidden className="overlay-sidebar-footer-spacer" />
      <a
        href="https://open-resource-discovery.org"
        target="_blank"
        rel="noreferrer"
      >
        open-resource-discovery.org
      </a>
    </footer>
  );
}

type SidebarLinkProps = {
  entry: Entry;
  isActive: boolean;
  query: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  plain?: boolean;
};

function SidebarLink({
  entry,
  isActive,
  query,
  onClick,
  plain,
}: SidebarLinkProps) {
  return (
    <li>
      <a
        href={`#${sectionDomId(entry.section)}`}
        onClick={onClick}
        className={cn(
          "overlay-sidebar-item",
          plain && "overlay-sidebar-item-plain",
          isActive && "overlay-sidebar-item-active",
        )}
      >
        {entry.action ? (
          <>
            <span
              className={cn(
                "overlay-sidebar-method",
                `overlay-sidebar-method-${actionVariant(entry.action)}`,
              )}
            >
              {formatAction(entry.action).toUpperCase()}
            </span>
            <span className="overlay-sidebar-item-label">
              {highlightMatch(entry.primary, query)}
            </span>
          </>
        ) : (
          highlightMatch(entry.primary, query)
        )}
      </a>
    </li>
  );
}
