import { prisma } from "~/infra/database";
import { Task, UpdateTask } from "~/zod/taskSchema";

export const findAll = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
    },
  });
  if (tasks.length === 0) {
    return null;
  }

  return tasks;
};

export const create = async (data: Task) => {
  const task = await prisma.task.create({ data });
  return task;
};

export const findOne = async (id: string) => {
  const task = await prisma.task.findFirst({
    where: { id },
  });
  return task;
};

export const update = async (id: string, data: UpdateTask) => {
  const now = new Date();
  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      updated_at: now,
    },
  });
  return updatedTask;
};

export const deleteOne = async (id: string) => {
  await prisma.task.delete({
    where: { id },
  });
};
