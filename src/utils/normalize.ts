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
  // Mantém string original (sem mexer em offset/hora)
  return s;
}

/** Verifica se a data/hora (com -03:00) é futura em relação a agora */
export function ensureFutureLocalBR(s: string): string {
  const d = new Date(s); // -03:00 respeitado
  if (isNaN(d.getTime())) throw new Error("Data/hora inválida");
  if (d.getTime() <= Date.now()) {
    throw new Error("Parece que a data/hora já passou; envie um horário futuro.");
  }
  return s;
}

// Se ainda referenciar essas em algum lugar, mantenha como no-ops/aliases:
export const ensureSeconds = (s: string) => s;
export const hasTZ = (s: string) => /[zZ]|[+\-]\d{2}:\d{2}$/.test(s);
