import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Define toOk and toErr locally if not provided by the SDK
function toOk(result: any) {
  return { ok: true, result };
}
function toErr(error: any) {
  return { ok: false, error };
}

import { BASE } from "./config";
import { http } from "./utils/http";

// ⬇️ CHANGED: troque os imports de ensureTZ/ensureFutureISO
// import { ensureFutureISO, ensureTZ, normalizePhone } from "./utils/normalize";
import { toBackendLocalDateTime, ensureFutureLocal, normalizePhone } from "./utils/normalize";

import {
  AgendarSchema,
  BuscarPorDataSchema,
  BuscarPorPeriodoSchema,
  AlterarDataSchema,
  DeletarSchema,
  type AgendarInput,
  type BuscarPorDataInput,
  type BuscarPorPeriodoInput,
  type AlterarDataInput,
  type DeletarInput,
} from "./schemas";

/** Cria e configura um MCP Server com as 5 tools */
export function makeMeetingsMcpServer() {
  const server = new McpServer({ name: "meetings-mcp-server", version: "1.0.0" });

  // Agendar
  server.registerTool(
    "agendar",
    {
      title: "Agendar reunião",
      description: "Cria uma nova reunião",
      inputSchema: AgendarSchema.shape,
    },
    async (args: AgendarInput) => {  // o parâmetro extra não é necessário aqui
      try {
        const clienteNumero = normalizePhone(args.clienteNumero);

        // ⬇️ CHANGED: normaliza p/ formato aceito pelo backend e valida futuro
        const localFmt = toBackendLocalDateTime(args.dataHora);
        const dataHora = ensureFutureLocal(localFmt);

        const body = JSON.stringify({ ...args, clienteNumero, dataHora });
        const resp = await http(`${BASE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        return {
          content: [{ type: "text", text: JSON.stringify(resp) }]
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `❌ ${e?.message ?? "Erro ao agendar."}` }]
        };
      }
    }
  );

  // Buscar por data
  server.registerTool(
    "buscarPorData",
    {
      title: "Buscar por data",
      description: "Lista reuniões de um dia (YYYY-MM-DD)",
      inputSchema: BuscarPorDataSchema.shape,
    },
    async (args: BuscarPorDataInput) => {
      try {
        const resp = await http(`${BASE}/?day=${encodeURIComponent(args.day)}`, { method: "GET" });
        return {
          content: [{ type: "text", text: JSON.stringify(resp) }]
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `❌ ${e?.message ?? "Erro ao buscar por data."}` }]
        };
      }
    }
  );

  // Buscar por período
  server.registerTool(
    "buscarPorPeriodo",
    {
      title: "Buscar por período",
      description: "Lista reuniões entre start e end (YYYY-MM-DD)",
      inputSchema: BuscarPorPeriodoSchema.shape,
    },
    async (args: BuscarPorPeriodoInput) => {
      try {
        if (args.start > args.end) throw new Error("Intervalo inválido: start > end.");
        const url = `${BASE}/?start=${encodeURIComponent(args.start)}&end=${encodeURIComponent(args.end)}`;
        const resp = await http(url, { method: "GET" });
        return {
          content: [{ type: "text", text: JSON.stringify(resp) }]
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `❌ ${e?.message ?? "Erro ao buscar por período."}` }]
        };
      }
    }
  );

  // Alterar data/hora
  server.registerTool(
    "alterarData",
    {
      title: "Alterar data/hora",
      description: "Altera data/hora de uma reunião existente",
      inputSchema: AlterarDataSchema.shape,
    },
    async (args: AlterarDataInput) => {
      try {
        // ⬇️ CHANGED: normaliza p/ formato aceito pelo backend e valida futuro
        const localFmt = toBackendLocalDateTime(args.novaDataHora);
        const normal = ensureFutureLocal(localFmt);

        const body = JSON.stringify({ novaDataHora: normal });
        const resp = await http(`${BASE}/${encodeURIComponent(args.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });

        return {
          content: [{ type: "text", text: JSON.stringify(resp) }]
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `❌ ${e?.message ?? "Erro ao alterar data."}` }]
        };
      }
    }
  );

  // Deletar
  server.registerTool(
    "deletar",
    {
      title: "Deletar reunião",
      description: "Remove uma reunião pelo ID",
      inputSchema: DeletarSchema.shape,
    },
    async (args: DeletarInput) => {
      try {
        const resp = await http(`${BASE}/${encodeURIComponent(args.id)}`, { method: "DELETE" });
        return {
          content: [{ type: "text", text: JSON.stringify(resp) }]
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `❌ ${e?.message ?? "Erro ao deletar."}` }]
        };
      }
    }
  );

  return server;
}
