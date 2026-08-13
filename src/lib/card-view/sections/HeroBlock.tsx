import {
  Badge,
  Card,
  MarkdownText,
} from "@open-resource-discovery/ui-components";
import type { OrdOverlay } from "../types";
import { visibilityVariant } from "../util/badgeVariants";
import { Mono, Row } from "./primitives";

type Props = { overlay: OrdOverlay };

function ProvenanceCard({ overlay }: { overlay: OrdOverlay }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Provenance</Card.Title>
        <Card.Description>
          How this overlay is identified and scoped.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <dl className="overlay-target-rows">
          <Row label="Spec">
            <Mono>ORD Overlay {overlay.ordOverlay}</Mono>
          </Row>
          {overlay.visibility ? (
            <Row label="Visibility">
              <Badge
                variant={visibilityVariant(overlay.visibility)}
                size="sm"
                className="uppercase"
              >
                {overlay.visibility}
              </Badge>
            </Row>
          ) : null}
          {overlay.perspective ? (
            <Row label="Perspective">
              <Mono>{overlay.perspective}</Mono>
            </Row>
          ) : null}
        </dl>
      </Card.Content>
    </Card>
  );
}

export function HeroBlock({ overlay }: Props) {
  const title = overlay.ordId ?? "ORD Overlay";
  return (
    <section id="overview" className="overlay-section overlay-hero">
      <div>
        <div className="overlay-hero-badges">
          <Badge variant="highlight" size="sm">
            v{overlay.ordOverlay}
          </Badge>
          {overlay.visibility ? (
            <Badge
              variant={visibilityVariant(overlay.visibility)}
              size="sm"
              className="uppercase"
            >
              {overlay.visibility}
            </Badge>
          ) : null}
          {overlay.perspective ? (
            <Badge variant="secondary" size="sm">
              {overlay.perspective}
            </Badge>
          ) : null}
        </div>
        <h1 className="overlay-hero-title">{title}</h1>
      </div>

      <div className="overlay-hero-columns">
        <div className="overlay-hero-main">
          {overlay.description ? (
            <div className="overlay-hero-description">
              <MarkdownText text={overlay.description} />
            </div>
          ) : null}
        </div>
        <div className="overlay-hero-side">
          <ProvenanceCard overlay={overlay} />
        </div>
      </div>
    </section>
  );
}
