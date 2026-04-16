import { TaskDelegate } from "@/generated/models";
import { prisma } from "~/infra/database";
import { Task as TaskEnt, UpdateTask } from "~/zod/taskSchema";

class TaskModel {
  private model: TaskDelegate;
  constructor() {
    this.model = prisma.task;
  }

  async findAll(userId: string) {
    const tasks = await this.model.findMany({
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
  }

  async create(providedData: TaskEnt, user_id: string) {
    const data = {
      ...providedData,
      user_id,
    };

    const task = await this.model.create({
      data,
    });

    return task;
  }

  async findOne(id: string) {
    const task = await this.model.findFirst({
      where: { id },
    });

    if (!task) return null;

    return task;
  }

  async update(id: string, providedData: UpdateTask) {
    const now = new Date();
    const data = {
      ...providedData,
      updated_at: now,
    };

    const updatedTask = await this.model.update({
      where: { id },
      data,
    });
    return updatedTask;
  }
  async deleteOne(id: string) {
    await this.model.delete({
      where: { id },
    });
  }
}

export const taskModel = new TaskModel();
