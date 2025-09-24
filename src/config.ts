import "dotenv/config";

export const BASE =
  process.env.MEETINGS_BASE?.replace(/\/+$/, "") ??
  "http://91.108.125.81:5555/api/meetings";

export const PORT = Number(process.env.MCP_PORT ?? 4000);
export const PATH = process.env.MCP_PATH ?? "/mcp";

export const HTTP_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS ?? 10000); // 10s
export const HTTP_MAX_RETRIES = Number(process.env.HTTP_MAX_RETRIES ?? 1);   // 1 retry
