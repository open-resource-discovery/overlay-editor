"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const HomePage = dynamic(
  () => import("@/components/playground/HomePage").then((m) => m.HomePage),
  {
    ssr: false,
    loading: () => (
      <div className="grid flex-1 place-items-center">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </span>
      </div>
    ),
  },
);

export default function Page() {
  return <HomePage />;
}
