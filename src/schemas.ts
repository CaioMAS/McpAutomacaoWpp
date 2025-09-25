import { z } from "zod";

// Somente data (para buscas)
const DateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

// DateTime ISO **com segundos** e **offset -03:00** (fixo)
const DateTimeISO_BR = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/,
    'Use "YYYY-MM-DDTHH:mm:ss-03:00" (ex.: 2025-09-25T10:30:00-03:00)'
  );

// Telefone (10 a 15 dígitos), com ou sem +
const PhoneE164Loose = z
  .string()
  .regex(/^\+?\d{10,15}$/, "clienteNumero E.164 (ex: 5531987654321)");

export const AgendarSchema = z.object({
  clienteNome: z.string().min(1, "clienteNome obrigatório"),
  clienteNumero: PhoneE164Loose,
  // ⬇️ Agora OBRIGATÓRIO: ISO com -03:00
  dataHora: DateTimeISO_BR,
  chefeNome: z.string().default("Ezequias"),
  cidadeOpcional: z.string().optional(),
});

export const BuscarPorDataSchema = z.object({
  day: DateOnly,
});

export const BuscarPorPeriodoSchema = z.object({
  start: DateOnly,
  end: DateOnly,
});

export const AlterarDataSchema = z.object({
  id: z.string().min(1, "id obrigatório"),
  // ⬇️ Também exigimos -03:00 aqui
  novaDataHora: DateTimeISO_BR,
});

export const DeletarSchema = z.object({
  id: z.string().min(1, "id obrigatório"),
});

// Tipos
export type AgendarInput = z.infer<typeof AgendarSchema>;
export type BuscarPorDataInput = z.infer<typeof BuscarPorDataSchema>;
export type BuscarPorPeriodoInput = z.infer<typeof BuscarPorPeriodoSchema>;
export type AlterarDataInput = z.infer<typeof AlterarDataSchema>;
export type DeletarInput = z.infer<typeof DeletarSchema>;
