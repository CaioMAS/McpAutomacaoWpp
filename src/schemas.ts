import { z } from "zod";

// Aceita: 2025-09-25T19:00:00Z  ou  2025-09-25T19:00:00-03:00
const DateTimeISO = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/,
    "Use formato ISO: YYYY-MM-DDTHH:mm:ssZ ou YYYY-MM-DDTHH:mm:ss-03:00"
  );

  const PhoneE164Digits = z
  .string()
  .regex(/^\+?\d{10,15}$/, "clienteNumero E.164 (ex: 5531987654321)")
  .transform((s) => s.replace(/\D/g, ""))
  .refine((s) => /^\d{10,15}$/.test(s), {
    message: "clienteNumero deve conter 10 a 15 dígitos após normalização",
  });

const OptStr = z.string().trim().min(1).optional();

export const AgendarSchema = z.object({
  clienteNome: z.string().trim().min(1, "clienteNome obrigatório"),
  clienteNumero: PhoneE164Digits,
  dataHora: DateTimeISO, // 🔴 só aceita ISO com offset explícito
  chefeNome: z.string().trim().default("Ezequias"),
  cidadeOpcional: OptStr,
  empresaNome: OptStr,
  endereco: OptStr,
  referidoPor: OptStr,
  funcionarios: z
    .number({ invalid_type_error: "funcionarios deve ser número" })
    .int("funcionarios deve ser inteiro")
    .min(0, "funcionarios não pode ser negativo")
    .optional(),
  faturamento: OptStr,
  observacoes: OptStr,
  instagram: OptStr,
});

export const BuscarPorDataSchema = z.object({
  day: DateTimeISO,
});

export const BuscarPorPeriodoSchema = z.object({
  start: z.string(),
  end: z.string(),
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
