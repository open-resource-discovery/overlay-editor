"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const Playground = dynamic(
  () => import("@/components/playground/Playground").then((m) => m.Playground),
  {
    ssr: false,
    loading: () => (
      <div className="grid flex-1 place-items-center">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading playground…
        </span>
      </div>
    ),
  },
);

export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <Playground />
    </Suspense>
  );
}
