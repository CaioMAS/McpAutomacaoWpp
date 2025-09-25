/** Mantém apenas dígitos e valida tamanho */
export function normalizePhone(num: string) {
  const only = num.replace(/\D/g, "");
  if (only.length < 10 || only.length > 15) {
    throw new Error("Telefone inválido (use DDI+DDD+Número, apenas dígitos).");
  }
  return only;
}

/**
 * Normaliza uma string para o formato aceito pelo backend:
 * YYYY-MM-DDTHH:mm:ss (sem timezone, sem 'Z').
 */
export function toBackendISODateTime(input: string) {
  let s = String(input).trim();

  // troca espaço por "T"
  s = s.replace(" ", "T");

  // remove milissegundos, se houver
  s = s.replace(/\.\d+/, "");

  // completa segundos se vier só até minutos
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)?$/.test(s)) {
    s = s.replace(/([+-]\d{2}:\d{2}|Z)?$/, ":00$1");
  }

  // valida formato ISO final
  const ok = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(s);
  if (!ok) {
    throw new Error(
      "Data/hora inválida (esperado ISO YYYY-MM-DDTHH:mm:ssZ ou YYYY-MM-DDTHH:mm:ss±HH:MM)"
    );
  }

  return s;
}

/**
 * Garante que a data/hora (interpretada como local) é futura e <= 90 dias.
 */
export function ensureFutureISO(isoDateTime: string) {
  const d = new Date(isoDateTime); // Node entende o offset/Z corretamente
  if (isNaN(d.getTime())) throw new Error("Data/hora inválida");
  const now = Date.now();
  const max = now + 90 * 24 * 60 * 60 * 1000;
  if (d.getTime() < now) throw new Error("A data/hora precisa ser futura.");
  if (d.getTime() > max) throw new Error("A data/hora não pode passar de 90 dias.");
  return isoDateTime;
}
