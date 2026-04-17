import { Response } from "express";
import { Task } from "@/generated/client.js";
import {
  idTaskSchema,
  taskSchema,
  updateTaskSchema,
} from "~/zod/taskSchema.js";
import { AuthenticatedRequest } from "~/middleware/authenticate.js";
import { canRequest } from "~/models/authorization.js";
import { CustomResponse } from "~/models/customResponse.js";
import { taskModel } from "~/models/task.js";

export const getAllTasks = async (req: AuthenticatedRequest, res: Response) => {
  const response = new CustomResponse(res);
  const user = getUserFromContext(req, response);
  if (!user) return;

  try {
    const tasks = await taskModel.findAll(user.id);
    if (!tasks) {
      response.noContent();
      return;
    }
    response.success({
      data: tasks,
      message: `Total de ${tasks.length} tarefa(s) encontrada(s)`,
    });
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

  const user = getUserFromContext(req, response);
  if (!user) return;

  try {
    const task = await taskModel.create(result.data, user.id);
    response.created({
      message: `Task ${task.id} adicionada com sucesso!`,
      data: task,
    });
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
    const task = await findTaskOrResponseNoContent(taskId, response);
    if (!task) return;

    if (!userCanRequest(req, response, task)) return;

    const updatedTask = await taskModel.update(taskId, result.data);
    response.created({
      message: `Task ${taskId} atualizada.`,
      data: updatedTask,
    });
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
    const task = await findTaskOrResponseNoContent(taskId, response);
    if (!task) return;

    if (!userCanRequest(req, response, task)) return;

    await taskModel.deleteOne(taskId);
    response.success({ message: `Task ${taskId} deletada com sucesso!` });
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
    const task = await findTaskOrResponseNoContent(taskId, response);
    if (!task) return;

    if (!userCanRequest(req, response, task)) return;

    response.success({ task });
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

function userCanRequest(
  req: AuthenticatedRequest,
  response: CustomResponse,
  task: Task,
) {
  const user = req.context?.user;
  if (!user) {
    response.unauthorized();
    return false;
  }

  if (!canRequest(user, task)) {
    response.forbidden("Voce não tem permissão executar essa ação.");
    return false;
  }

  return true;
}

async function findTaskOrResponseNoContent(
  taskId: string,
  response: CustomResponse,
) {
  const task = await taskModel.findOne(taskId);
  if (!task) {
    response.noContent();
    return false;
  }
  return task;
}

function getUserFromContext(
  req: AuthenticatedRequest,
  response: CustomResponse,
) {
  const user = req.context?.user;
  if (!user) {
    response.unauthorized("Faça o login.");
    return false;
  }
  return user;
}
