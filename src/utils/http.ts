import { HTTP_MAX_RETRIES, HTTP_TIMEOUT_MS } from "../config";

/** Resposta MCP de sucesso (sempre texto) */
export function toOk(text: string) {
  return { content: [{ type: "text", text }] } as const;
}

/** Resposta MCP de erro (sempre texto, prefixo ❌) */
export function toErr(text: string) {
  return { content: [{ type: "text", text: `❌ ${text}` }] } as const;
}

/** fetch com timeout + retry básico (5xx / rede) */
export async function http<T>(url: string, init?: RequestInit): Promise<T> {
  let attempt = 0;
  let lastErr: any;

  while (attempt <= HTTP_MAX_RETRIES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      const text = await res.text();
      clearTimeout(timer);

      let data: any;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!res.ok) {
        const msg =
          typeof data === "string"
            ? data
            : data?.error || data?.message || JSON.stringify(data);
        throw new Error(`HTTP ${res.status} ${res.statusText} → ${msg}`);
      }
      return data as T;
    } catch (e: any) {
      clearTimeout(timer);
      lastErr = e;
      const transient =
        e?.name === "AbortError" ||
        /ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(String(e?.code)) ||
        /HTTP 5\d{2}/.test(String(e?.message));
      if (!transient || attempt === HTTP_MAX_RETRIES) break;
      attempt += 1;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}
