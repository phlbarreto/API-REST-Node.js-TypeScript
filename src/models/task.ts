import { prisma } from "~/infra/database";
import { Task, UpdateTask } from "~/zod/taskSchema";

export const findAll = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
    },
    take: 15,
    orderBy: {
      updated_at: "desc",
    },
  });

  if (tasks.length === 0) return null;

  return tasks;
};

export const create = async (providedData: Task, user_id: string) => {
  const data = {
    ...providedData,
    user_id,
  };

  const task = await prisma.task.create({
    data,
  });

  return task;
};

export const findOne = async (id: string) => {
  const task = await prisma.task.findFirst({
    where: { id },
  });

  if (!task) return null;

  return task;
};

export const update = async (id: string, providedData: UpdateTask) => {
  const now = new Date();
  const data = {
    ...providedData,
    updated_at: now,
  };

  const updatedTask = await prisma.task.update({
    where: { id },
    data,
  });
  return updatedTask;
};

export const deleteOne = async (id: string) => {
  await prisma.task.delete({
    where: { id },
  });
};
