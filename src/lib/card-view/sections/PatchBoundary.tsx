import { Component, type ReactNode } from "react";

type Props = {
  /**
   * When this value changes, a previously caught error is cleared and the
   * children are rendered again. Pass something derived from the underlying
   * patch so an edit that fixes the document recovers the card — without
   * remounting a healthy child on every unrelated re-render.
   */
  resetKey: unknown;
  children: ReactNode;
};

type State = { hasError: boolean };

/**
 * Per-patch error boundary. A render failure in one patch degrades to a
 * fallback callout instead of taking down the whole overlay card view.
 * Modeled on the website playground's `ResettableErrorBoundary`.
 */
export class PatchBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="overlay-patch-anchor">
          <div className="overlay-callout overlay-callout-destructive">
            This patch could not be displayed.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
