import { z } from "zod";

const DateTimeLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "Use YYYY-MM-DDTHH:mm:ss");

export const AgendarSchema = z.object({
  clienteNome: z.string().min(1, "clienteNome obrigatório"),
  clienteNumero: z.string().regex(/^\+?\d{10,15}$/, "clienteNumero E.164 (ex: 5531987654321)"),
  dataHora: DateTimeLocal,
  chefeNome: z.string().default("Ezequias"),
  cidadeOpcional: z.string().optional(),
});

export const BuscarPorDataSchema = z.object({
  day: DateTimeLocal,
});

export const BuscarPorPeriodoSchema = z.object({
  start: DateTimeLocal,
  end: DateTimeLocal,
});

export const AlterarDataSchema = z.object({
  id: z.string().min(1, "id obrigatório"),
  novaDataHora: DateTimeLocal,
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
