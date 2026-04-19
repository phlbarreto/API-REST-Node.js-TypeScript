import { prisma } from "~/infra/database.js";
import { BaseModel } from "~/models/base.js";
import { TaskDelegate } from "@/generated/models.js";
import { TaskInput, UpdateTask } from "~/zod/taskSchema.js";
import { Task } from "@/generated/client.js";

class TaskModel extends BaseModel<TaskDelegate> {
  constructor(model: TaskDelegate) {
    super(model);
  }

  async findAll(userId: string): Promise<Task[] | null> {
    const tasks: Task[] = await this.findMany({
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

  async create(providedData: TaskInput, user_id: string): Promise<Task> {
    const data = {
      ...providedData,
      user_id,
    };

    return await this.createOne(data);
  }

  async findOne(id: string): Promise<Task | null> {
    const task: Task = await this.findFirst({
      where: { id },
    });

    if (!task) return null;

    return task;
  }

  async update(id: string, providedData: UpdateTask): Promise<Task | null> {
    const now = new Date();
    const data = {
      ...providedData,
      updated_at: now,
    };

    const updatedTask = await this.updateOne({ id }, data);
    return updatedTask;
  }

  async deleteOne(id: string) {
    await this.deleteOneById({ id });
  }
}

export const taskModel = new TaskModel(prisma.task);
