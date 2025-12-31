#!/usr/bin/env node
/**
 * TouchDesigner MCP Server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TDClient } from "td-api";
import { z } from "zod";

const client = new TDClient();

const server = new McpServer({
  name: "touchdesigner",
  version: "0.1.0",
});

// -----------------------------------------------------------------------------
// td_execute - Execute Python code in TouchDesigner
// -----------------------------------------------------------------------------

server.registerTool(
  "td_execute",
  {
    title: "Execute Python",
    description:
      "Execute Python code in TouchDesigner. The code runs in TD's Python environment with access to all TD modules (op, ui, etc.). Use 'me' to reference the context operator specified by from_op.",
    inputSchema: {
      code: z.string().describe("Python code to execute"),
      from_op: z
        .string()
        .optional()
        .describe("Context operator path (default: '/')"),
    },
  },
  async ({ code, from_op }) => {
    const result = await client.execute(code, from_op ?? "/");
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// -----------------------------------------------------------------------------
// td_pane - Get current pane state
// -----------------------------------------------------------------------------

server.registerTool(
  "td_pane",
  {
    title: "Get Pane State",
    description:
      "Get the current network editor pane state including the network path, position (x, y), and zoom level.",
    inputSchema: {},
  },
  async () => {
    const result = await client.getPaneState();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// -----------------------------------------------------------------------------
// td_selection - Get selected operators
// -----------------------------------------------------------------------------

server.registerTool(
  "td_selection",
  {
    title: "Get Selection",
    description:
      "Get the currently selected operators in the network editor. Returns operator info including path, name, type, and family.",
    inputSchema: {},
  },
  async () => {
    const result = await client.getSelection();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// -----------------------------------------------------------------------------
// td_operators - Get operators at path
// -----------------------------------------------------------------------------

server.registerTool(
  "td_operators",
  {
    title: "List Operators",
    description:
      "List all child operators at the specified path. Returns operator info including name, type, and opType.",
    inputSchema: {
      path: z.string().optional().describe("Operator path (default: '/')"),
    },
  },
  async ({ path }) => {
    const result = await client.getOperators(path ?? "/");
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// -----------------------------------------------------------------------------
// Start server
// -----------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
