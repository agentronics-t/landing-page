/**
 * Minimal WebMCP surface for the marketing site.
 *
 * Follows the October 2026 draft: tools go on `document.modelContext` via an
 * async `registerTool(tool, { signal })` and are removed by aborting the
 * signal. Older shapes (`navigator.modelContext`, `registerTool` returning
 * `{ unregister }`) are still accepted. When the browser has neither, we
 * install a small polyfill on both `document` and `navigator` that also
 * exposes the host side (`listTools` / `callTool`) so the Agentronics
 * extension or an agent harness can enumerate and invoke the tools.
 */

export interface McpTextContent {
  type: "text";
  text: string;
}

export interface McpToolResult {
  content: McpTextContent[];
  /** Machine-readable result for agents that prefer structured data. */
  structuredContent?: unknown;
  isError?: boolean;
}

export interface WebMcpTool {
  name: string;
  title?: string;
  description: string;
  /** JSON Schema for the tool's arguments. */
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => McpToolResult | Promise<McpToolResult>;
}

export type ToolDescriptor = Pick<WebMcpTool, "name" | "description" | "inputSchema">;

interface ModelContextLike {
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): unknown;
  listTools?(): ToolDescriptor[];
  callTool?(name: string, args?: Record<string, unknown>): Promise<McpToolResult>;
}

function textResult(text: string, isError = false): McpToolResult {
  return { content: [{ type: "text", text }], isError };
}

function installPolyfill(): ModelContextLike {
  const tools = new Map<string, WebMcpTool>();
  const mc: ModelContextLike = {
    registerTool(tool, options) {
      tools.set(tool.name, tool);
      const unregister = () => {
        if (tools.get(tool.name) === tool) tools.delete(tool.name);
      };
      options?.signal?.addEventListener("abort", unregister, { once: true });
      return { unregister };
    },
    listTools() {
      return [...tools.values()].map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
    },
    async callTool(name, args = {}) {
      const tool = tools.get(name);
      if (!tool) return textResult(`Unknown tool: ${name}`, true);
      try {
        return await tool.execute(args);
      } catch (err) {
        return textResult(`Tool "${name}" failed: ${err instanceof Error ? err.message : String(err)}`, true);
      }
    },
  };
  Object.defineProperty(document, "modelContext", { value: mc, configurable: true });
  Object.defineProperty(navigator, "modelContext", { value: mc, configurable: true });
  return mc;
}

/** The page's model context: native (document, then navigator), else our polyfill. */
export function ensureModelContext(): ModelContextLike {
  const doc = (document as Document & { modelContext?: ModelContextLike }).modelContext;
  if (doc && typeof doc.registerTool === "function") return doc;
  const nav = (navigator as Navigator & { modelContext?: ModelContextLike }).modelContext;
  if (nav && typeof nav.registerTool === "function") return nav;
  return installPolyfill();
}

/** Register a tool on whichever API is present. Returns a function that removes it. */
export function registerSiteTool(mc: ModelContextLike, tool: WebMcpTool): () => void {
  const controller = new AbortController();
  let handle: unknown;
  try {
    handle = mc.registerTool(tool, { signal: controller.signal });
  } catch (err) {
    console.warn(`[WebMCP] couldn't register ${tool.name}`, err);
  }
  if (handle instanceof Promise) handle.catch((err) => console.warn(`[WebMCP] couldn't register ${tool.name}`, err));
  return () => {
    controller.abort();
    const legacy = handle as { unregister?: () => void } | undefined;
    if (legacy && typeof legacy.unregister === "function") legacy.unregister();
  };
}
