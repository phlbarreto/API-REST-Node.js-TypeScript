import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { taskSchema, updateTaskSchema } from "../zod/taskSchema";
import z from "zod";
import { validateSession } from "../utils/auth";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.session;
    if (!sessionId) {
      return res.status(401).json({
        Error: "Não autorizado!",
      });
    }

    const user = await validateSession(sessionId);
    if (!user) {
      return res.status(403).json({ Error: "Sessão inválida!" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        user_id: Number(user.id),
      },
    });

    if (tasks.length === 0) {
      return res.status(204).json();
    }
    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao buscar tasks", error });
  }
};

export const insertTask = async (req: Request, res: Response) => {
  const { data, error } = taskSchema.safeParse(req.body);
  if (error) {
    const flatErr = z.flattenError(error).fieldErrors;
    return res.status(400).json(flatErr);
  }
  try {
    const task = await prisma.task.create({ data });
    res.status(201).json({ sucess: `Task ${task.id} adicionada com sucesso!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao inserir task", error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ Error: "Id inválido!" });
  }
  const { error, data } = updateTaskSchema.safeParse(req.body);
  if (error) {
    const flatErr = z.flattenError(error).formErrors;
    return res.status(400).json({
      Error: "Nenhuma informação para atualizar!",
      error: flatErr,
    });
  }

  try {
    await prisma.task.update({
      where: { id: Number(id) },
      data,
    });
    res.status(201).json({ sucess: `Task ${id} atualizada:`, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao atualizar tasks", error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ Error: "Id da task inválidos!" });
    }
    await prisma.task.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ sucess: `Task ${id} deletada com sucesso!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao deletar task", error });
  }
};
