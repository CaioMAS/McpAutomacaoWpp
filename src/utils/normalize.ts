/** Mantém apenas dígitos e valida tamanho */
export function normalizePhone(num: string) {
  const only = num.replace(/\D/g, "");
  if (only.length < 10 || only.length > 15) {
    throw new Error("Telefone inválido (use DDI+DDD+Número, apenas dígitos).");
  }
  return only;
}

/** Garante timezone (anexa -03:00 se não houver TZ) */
export function ensureTZ(iso: string) {
  if (/[+-]\d{2}:\d{2}$/.test(iso) || iso.endsWith("Z")) return iso;
  return `${iso}-03:00`;
}

/** Valida futuro e limita a 90 dias; devolve ISO normalizado */
export function ensureFutureISO(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) throw new Error("Data/hora inválida (ISO esperado).");
  const now = Date.now();
  const max = now + 90 * 24 * 60 * 60 * 1000;
  if (+d < now) throw new Error("A data/hora precisa ser futura.");
  if (+d > max) throw new Error("A data/hora não pode passar de 90 dias.");
  return d.toISOString();
}
