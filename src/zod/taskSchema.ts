import * as z from "zod";

export const taskSchema = z.object({
  title: z.string("Titulo é obrigatório!"),
  description: z.string("Descrição é obrigatória!"),
  status: z.enum(["pending", "in_progress", "done"]),
  user_id: z.number("UserId é obrigatório!"),
});

export const updateTaskSchema = taskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "É necessário enviar pelo menos um campo para atualização",
  });
