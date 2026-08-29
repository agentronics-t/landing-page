/**
 * Minimal WebMCP surface for the marketing site.
 *
 * WebMCP is the emerging browser standard where a page exposes typed tools to
 * visiting AI agents via `navigator.modelContext.registerTool(...)`. No browser
 * ships it natively yet, so we install a small polyfill: sites register tools
 * the same way they will against the real API, and — because there's no native
 * agent host in the page either — the polyfill also exposes the host side
 * (`listTools` / `callTool`) so the Agentronics extension, an agent harness, or
 * our own on-page demo can enumerate and invoke them.
 *
 * If a browser ever ships a native `navigator.modelContext`, we defer to it for
 * registration so real agents see the tools; host helpers are then only present
 * if that native object provides them.
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
  description: string;
  /** JSON Schema for the tool's arguments. */
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => McpToolResult | Promise<McpToolResult>;
}

export type ToolDescriptor = Pick<WebMcpTool, "name" | "description" | "inputSchema">;

export interface ModelContext {
  registerTool(tool: WebMcpTool): { unregister(): void };
  unregisterTool(name: string): void;
  /** Host side — enumerate registered tools. */
  listTools?(): ToolDescriptor[];
  /** Host side — invoke a registered tool by name. */
  callTool?(name: string, args?: Record<string, unknown>): Promise<McpToolResult>;
  addEventListener?(type: "toolschange", cb: () => void): void;
  removeEventListener?(type: "toolschange", cb: () => void): void;
}

function textResult(text: string, isError = false): McpToolResult {
  return { content: [{ type: "text", text }], isError };
}

/**
 * Return the page's `navigator.modelContext`, installing our polyfill if the
 * browser has none. Safe to call repeatedly; only ever installs once.
 */
export function ensureModelContext(): ModelContext {
  const nav = navigator as Navigator & { modelContext?: ModelContext };
  if (nav.modelContext && typeof nav.modelContext.registerTool === "function") {
    return nav.modelContext;
  }

  const tools = new Map<string, WebMcpTool>();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const mc: ModelContext = {
    registerTool(tool) {
      tools.set(tool.name, tool);
      emit();
      return {
        unregister() {
          if (tools.get(tool.name) === tool) {
            tools.delete(tool.name);
            emit();
          }
        },
      };
    },
    unregisterTool(name) {
      if (tools.delete(name)) emit();
    },
    listTools() {
      return [...tools.values()].map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      }));
    },
    async callTool(name, args = {}) {
      const tool = tools.get(name);
      if (!tool) return textResult(`Unknown tool: ${name}`, true);
      try {
        return await tool.execute(args);
      } catch (err) {
        return textResult(
          `Tool "${name}" failed: ${err instanceof Error ? err.message : String(err)}`,
          true,
        );
      }
    },
    addEventListener(_type, cb) {
      listeners.add(cb);
    },
    removeEventListener(_type, cb) {
      listeners.delete(cb);
    },
  };

  Object.defineProperty(nav, "modelContext", { value: mc, configurable: true });
  return mc;
}
