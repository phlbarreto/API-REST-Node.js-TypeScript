import * as z from "zod";
import { pt } from "zod/locales";
z.config(pt());

export const taskSchema = z.object({
  title: z
    .string("Coluna 'title' é obrigatório!")
    .min(5, "O título deve conter no mínimo 5 caracteres.")
    .max(200, "O título deve conter no máximo 200 caracteres."),
  description: z
    .string("Coluna 'description' é obrigatória!")
    .min(10, "A descrição deve conter no mínimo 10 caracteres.")
    .max(500, "A descrição deve conter no máximo 500 caracteres."),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
});

export type Task = z.infer<typeof taskSchema>;

export const updateTaskSchema = taskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "É necessário enviar pelo menos um campo para atualização",
  });

export type UpdateTask = z.infer<typeof updateTaskSchema>;

export const idTaskSchema = z.object({
  id: z.uuidv4("Id da task deve ser do tipo UUID."),
});
