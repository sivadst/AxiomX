"use client";

import dynamic from "next/dynamic";

const CommandCenter = dynamic(
  () => import("@/components/CommandCenter"),
  { ssr: false }
);

export default function Home() {
  return <CommandCenter />;
}
