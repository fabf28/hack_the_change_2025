"use client";

import IssuesMap from "@/lib/IssuesMap";
import { createRestProvider } from "@/lib/data/restProvider";

const provider = createRestProvider("http://localhost:4000/api/issues");

export default function Page() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <IssuesMap dataProvider={provider} />
    </main>
  );
}
