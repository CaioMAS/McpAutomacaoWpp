import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { PATH, PORT, BASE } from "./config";
import { makeMeetingsMcpServer } from "./mcpServer";

export function makeExpressApp() {
  const app = express();

  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "mcp-session-id"],
  }));
  app.use(express.json({ limit: "1mb" }));

  // Armazena transports por sessão
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  // POST /mcp – client → server
  app.post(PATH, async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // nova sessão
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => { transports[sid] = transport; },
        // enableDnsRebindingProtection: true,
        // allowedHosts: ['127.0.0.1'],
      });

      transport.onclose = () => {
        if (transport.sessionId) delete transports[transport.sessionId];
      };

      // cria um MCP server para esta sessão
      const mcp = makeMeetingsMcpServer();
      await mcp.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID provided" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  });

  // GET /mcp – SSE server → client
  const handleSessionRequest = async (req: express.Request, res: express.Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  };

  app.get(PATH, handleSessionRequest);
  app.delete(PATH, handleSessionRequest);

  // start
  app.listen(PORT, () => {
    console.error(`[MCP] Streamable HTTP ON → http://0.0.0.0:${PORT}${PATH}`);
    console.error(`[MCP] BACKEND → ${BASE}`);
  });

  return app;
}
