// utils/normalize.ts

const ISO_BR_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/;

export function normalizePhone(input: string): string {
  const digits = (input || "").replace(/\D+/g, "");
  if (!digits) throw new Error("clienteNumero inválido");
  // Prefixa 55 se não houver DDI
  const withDDI = digits.startsWith("55") ? digits : `55${digits}`;
  if (withDDI.length < 10 || withDDI.length > 15) {
    throw new Error("clienteNumero fora do padrão E.164 (10-15 dígitos após +)");
  }
  return withDDI;
}

/** Garante exatamente "YYYY-MM-DDTHH:mm:ss-03:00" */
export function ensureISO_BR_Offset(s: string): string {
  if (!ISO_BR_REGEX.test(s)) {
    throw new Error('Data/hora deve estar em "YYYY-MM-DDTHH:mm:ss-03:00"');
  }
  // Testa parseabilidade
  const d = new Date(s);
  if (isNaN(d.getTime())) {
    throw new Error("Data/hora inválida");
  }
  return s;
}

/** Verifica se a data/hora (com -03:00) é futura em relação a agora (fuso America/Sao_Paulo) */
export function ensureFutureLocalBR(s: string): string {
  const d = new Date(s); // -03:00 respeitado
  if (isNaN(d.getTime())) throw new Error("Data/hora inválida");

  // calcula "agora" também no fuso -03:00
  const nowUtc = new Date();
  // converte "agora" UTC para America/Sao_Paulo (fixo -03:00)
  const nowLocalMs = nowUtc.getTime() - 3 * 60 * 60 * 1000;
  const nowLocal = new Date(nowLocalMs);

  if (d.getTime() <= nowLocal.getTime()) {
    throw new Error("Parece que a data/hora já passou; envie um horário futuro.");
  }
  return s;
}

// compatibilidade: se ainda forem usados em outros pontos
export const ensureSeconds = (s: string) => s;
export const hasTZ = (s: string) => /[zZ]|[+\-]\d{2}:\d{2}$/.test(s);
