import retry from "async-retry";
import { faker } from "@faker-js/faker";
import { userModel } from "~/models/user.js";
import { UserInput } from "~/zod/userSchema.js";
import { AuthenticatedUser, sessionModel } from "~/models/session.js";
import { taskModel } from "~/models/task.js";
import { TaskInput } from "~/zod/taskSchema.js";

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

export async function createUser(userValues?: UserInput) {
  return await userModel.create({
    name: userValues?.name ?? faker.person.fullName().slice(0, 30),
    email: userValues?.email ?? faker.internet.email(),
    password: userValues?.password ?? "ValidPassword",
  });
}

export async function createSession(user: AuthenticatedUser) {
  return await sessionModel.create(user.id);
}

export async function createTask(task: TaskInput, user: AuthenticatedUser) {
  return await taskModel.create(task, user.id);
}

export function generateUserData() {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName().slice(0, 30),
    password: faker.internet.password({ length: 20 }),
  };
}
