import retry from "async-retry";
import { faker } from "@faker-js/faker";
import { resetDatabase } from "~/infra/scripts/migrator.js";
import { registerUser } from "~/models/user.js";
import { UserInput } from "~/zod/userSchema.js";
import * as session from "~/models/session.js";
import { taskModel } from "~/models/task.js";
import { Task } from "~/zod/taskSchema.js";

const apiBaseUrl = "http://localhost:5001";

export const API = {
  user: `${apiBaseUrl}/user`,
  login: `${apiBaseUrl}/login`,
  task: `${apiBaseUrl}/tasks`,
};

export async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchIndexPage, {
      retries: 100,
      maxTimeout: 1000,
    });
  }
  async function fetchIndexPage() {
    const response = await fetch(apiBaseUrl);
    if (response.status !== 200) throw Error();
  }
}

export async function clearDatabase() {
  await resetDatabase();
}

export async function createUser(userValues?: UserInput) {
  return await registerUser({
    name: userValues?.name ?? faker.person.fullName(),
    email: userValues?.email ?? faker.internet.email(),
    password: userValues?.password ?? "ValidPassword",
  });
}

export async function createSession(user: session.AuthenticatedUser) {
  return await session.createSession(user.id);
}

export async function createTask(task: Task, user: session.AuthenticatedUser) {
  return await taskModel.create(task, user.id);
}
