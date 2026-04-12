import { Response } from "express";
import { idTaskSchema, taskSchema, updateTaskSchema } from "~/zod/taskSchema";
import { AuthenticatedRequest } from "~/middleware/authenticate";
import { CustomResponse } from "~/models/response";
import { create, deleteOne, findAll, findOne, update } from "~/models/task";

export const getAllTasks = async (req: AuthenticatedRequest, res: Response) => {
  const response = new CustomResponse(res);
  const user = req.context?.user;
  if (!user) {
    response.unauthorized("Não autorizado!", "Faça o login.");
    return;
  }

  try {
    const tasks = await findAll(user.id);
    if (!tasks) {
      response.noContet("Nenhuma tarefa encontrada.");
      return;
    }
    response.success(`Total de ${tasks.length} tarefa(s) encontrada(s)`, tasks);
  } catch (error) {
    console.error("Erro ao buscar tasks: ", error);
    response.internalServerError();
  }
};

export const insertTask = async (req: AuthenticatedRequest, res: Response) => {
  const response = new CustomResponse(res);
  const result = taskSchema.safeParse(req.body);
  if (result.error) {
    response.badRequest(result.error);
    return;
  }
  try {
    const task = await create(result.data);
    response.created(`Task ${task.id} adicionada com sucesso!`, task);
  } catch (error) {
    console.error("Erro ao inserir task: ", error);
    response.internalServerError();
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  const response = new CustomResponse(res);
  const taskId = isValidTaskId(req, response);
  if (!taskId) return;

  const result = updateTaskSchema.safeParse(req.body);
  if (result.error) {
    response.badRequest(result.error);
    return;
  }

  try {
    const task = await update(taskId, result.data);
    response.created(`Task ${taskId} atualizada.`, task);
  } catch (error) {
    console.error("Erro ao atualizar tasks: ", error);
    response.internalServerError();
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  const response = new CustomResponse(res);
  const taskId = isValidTaskId(req, response);
  if (!taskId) return;

  try {
    await deleteOne(taskId);
    response.success(`Task ${taskId} deletada com sucesso!`);
  } catch (error) {
    console.error("Erro ao deletar task: ", error);
    response.internalServerError();
  }
};

export const getOneTask = async (req: AuthenticatedRequest, res: Response) => {
  const response = new CustomResponse(res);
  const taskId = isValidTaskId(req, response);
  if (!taskId) return;

  try {
    const task = await findOne(taskId);
    response.success(undefined, task);
  } catch (error) {
    console.error("Erro ao buscar task: ", error);
    response.internalServerError();
  }
};

function isValidTaskId(
  req: AuthenticatedRequest,
  response: CustomResponse,
): false | string {
  const result = idTaskSchema.safeParse(req.params);

  if (result.error) {
    response.badRequest(result.error);
    return false;
  }

  return result.data.id;
}
