import * as z from "zod";
import { pt } from "zod/locales";
z.config(pt());

export const registerSchema = z.object({
  name: z
    .string("Nome é obrigatório.")
    .min(3, "Nome deve ter no mínimo 3 caracteres.")
    .max(30, "Nome deve ter no máximo 30 caracteres."),
  email: z.email("Email não enviado ou inválido."),
  password: z
    .string("Senha é obrigátoria.")
    .min(8, "Senha deve ter no mínimo 8 caracteres.")
    .max(60, "Senha deve ter no máximo 60 caracteres."),
});

export type UserInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Email não enviado ou inválido."),
  password: z.string("Senha obrigatória."),
});

export type LoginInput = z.infer<typeof loginSchema>;
