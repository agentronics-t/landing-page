"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureModelContext, registerSiteTool, type ToolDescriptor } from "@/lib/webmcp";
import { buildTools } from "@/lib/webmcp-tools";
import { AgentReadyBadge } from "./AgentReadyBadge";

/**
 * Registers the site's WebMCP tools on `document.modelContext` (polyfilled if
 * the browser has none) so visiting agents can price, compare, search docs, and
 * move through the funnel without scraping. Headless except for the small
 * agent-ready showcase badge. Mounted once in the root layout.
 */
export function WebMcpProvider() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolDescriptor[]>([]);

  useEffect(() => {
    const mc = ensureModelContext();
    const defs = buildTools((path) => router.push(path));
    const removers = defs.map((tool) => registerSiteTool(mc, tool));
    setTools(defs.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })));

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info(
        `[WebMCP] Agentronics exposes ${defs.length} tools via document.modelContext: ${defs
          .map((d) => d.name)
          .join(", ")}`,
      );
    }

    return () => removers.forEach((remove) => remove());
  }, [router]);

  return <AgentReadyBadge tools={tools} />;
}
