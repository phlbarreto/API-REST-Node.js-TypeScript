import * as z from "zod";
import { pt } from "zod/locales";
z.config(pt());

export const taskSchema = z.object({
  title: z.string("Coluna 'title' é obrigatório!"),
  description: z.string("coluna 'description' é obrigatória!"),
  status: z.enum(["pending", "in_progress", "done"]),
  user_id: z.string("Coluna 'user_id' é obrigatório!"),
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
