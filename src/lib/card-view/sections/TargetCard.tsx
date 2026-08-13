import { Card } from "@open-resource-discovery/ui-components";
import { ExternalLink, Target } from "lucide-react";
import type { OverlayTarget } from "../types";
import { Mono, Row } from "./primitives";

type Props = { target: OverlayTarget };

export function TargetCard({ target }: Props) {
  const hasAnything =
    target.ordId ||
    target.url ||
    target.definitionType ||
    target.correlationIds?.length;
  if (!hasAnything) return null;

  return (
    <section id="target" className="overlay-section">
      <header className="overlay-section-header">
        <div className="overlay-section-header-left">
          <Target size={18} aria-hidden />
          <h2 className="overlay-section-title">Target</h2>
        </div>
      </header>
      <Card className="overlay-target-card">
        <Card.Header>
          <Card.Description>
            Identifies the resource or definition file this overlay patches.
          </Card.Description>
        </Card.Header>
        <Card.Content className="overlay-target-rows">
          {target.ordId ? (
            <Row label="ORD ID">
              <Mono>{target.ordId}</Mono>
            </Row>
          ) : null}
          {target.definitionType ? (
            <Row label="Definition type">
              <Mono>{target.definitionType}</Mono>
            </Row>
          ) : null}
          {target.url ? (
            <Row label="URL">
              <a
                href={target.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline break-all"
              >
                <span className="font-mono text-sm">{target.url}</span>
                <ExternalLink size={14} aria-hidden />
              </a>
            </Row>
          ) : null}
          {target.correlationIds && target.correlationIds.length > 0 ? (
            <Row label="Correlation IDs">
              <span className="flex flex-wrap gap-1">
                {target.correlationIds.map((id) => (
                  <code
                    key={id}
                    className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded"
                  >
                    {id}
                  </code>
                ))}
              </span>
            </Row>
          ) : null}
        </Card.Content>
      </Card>
    </section>
  );
}
