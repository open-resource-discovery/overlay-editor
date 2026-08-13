import { useMemo, useState } from "react";
import { Button } from "@open-resource-discovery/ui-components";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { OVERLAY_SPEC_URL, type OrdOverlay } from "../types";
import {
  downloadAsFile,
  overlayFilenameFor,
  prettifyJson,
} from "../util/download";

const COPY_FEEDBACK_DURATION_MS = 1500;

type Props = {
  overlay: OrdOverlay;
  rawContent: string;
  currentSectionLabel: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function OverlayToolbar({
  overlay,
  rawContent,
  currentSectionLabel,
}: Props) {
  const [justCopied, setJustCopied] = useState(false);
  const downloadableContent = useMemo(
    () => prettifyJson(rawContent),
    [rawContent],
  );

  const handleDownload = () => {
    downloadAsFile(
      downloadableContent,
      overlayFilenameFor(overlay.ordId),
      "application/json",
    );
  };

  const handleCopy = async () => {
    if (await copyToClipboard(rawContent)) {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), COPY_FEEDBACK_DURATION_MS);
    }
  };

  return (
    <header className="overlay-toolbar">
      <div className="overlay-toolbar-left">
        <span className="overlay-toolbar-section" title={currentSectionLabel}>
          {currentSectionLabel}
        </span>
      </div>
      <div className="overlay-toolbar-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          aria-label="Download overlay"
        >
          <Download size={14} aria-hidden />
          <span>Download</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label="Copy raw overlay"
        >
          {justCopied ? (
            <Check size={14} aria-hidden />
          ) : (
            <Copy size={14} aria-hidden />
          )}
          <span>{justCopied ? "Copied" : "Copy"}</span>
        </Button>
        <a
          href={OVERLAY_SPEC_URL}
          target="_blank"
          rel="noreferrer"
          className="overlay-toolbar-link"
          aria-label="Open ORD Overlay specification"
        >
          <span>Spec</span>
          <ExternalLink size={12} aria-hidden />
        </a>
      </div>
    </header>
  );
}
