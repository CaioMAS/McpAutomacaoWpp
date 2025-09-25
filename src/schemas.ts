import { z } from "zod";

// Aceita: 2025-09-25T19:00:00Z  ou  2025-09-25T19:00:00-03:00
const DateTimeISO = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/,
    "Use formato ISO: YYYY-MM-DDTHH:mm:ssZ ou YYYY-MM-DDTHH:mm:ss-03:00"
  );

export const AgendarSchema = z.object({
  clienteNome: z.string().min(1, "clienteNome obrigatório"),
  clienteNumero: z
    .string()
    .regex(/^\+?\d{10,15}$/, "clienteNumero E.164 (ex: 5531987654321)"),
  dataHora: DateTimeISO,
  chefeNome: z.string().default("Ezequias"),
  cidadeOpcional: z.string().optional(),
});

export const BuscarPorDataSchema = z.object({
  day: DateTimeISO,
});

export const BuscarPorPeriodoSchema = z.object({
  start: z.string().datetime({ offset: true }), // Exemplo de tipo complexo
  end: z.string().datetime({ offset: true }),
});

export const AlterarDataSchema = z.object({
  id: z.string().min(1, "id obrigatório"),
  novaDataHora: DateTimeISO,
});

export const DeletarSchema = z.object({
  id: z.string().min(1, "id obrigatório"),
});

// Tipos inferidos (úteis nos handlers)
export type AgendarInput = z.infer<typeof AgendarSchema>;
export type BuscarPorDataInput = z.infer<typeof BuscarPorDataSchema>;
export type BuscarPorPeriodoInput = z.infer<typeof BuscarPorPeriodoSchema>;
export type AlterarDataInput = z.infer<typeof AlterarDataSchema>;
export type DeletarInput = z.infer<typeof DeletarSchema>;
