import { Task, UserSession } from "@/generated/client.js";
import { AuthenticatedUser } from "~/models/session.js";
import {
  API,
  createSession,
  createTask,
  createUser,
  waitForAllServices,
} from "$/orchestrator.js";

beforeAll(async () => {
  await waitForAllServices();
});

let newUser: AuthenticatedUser;
let session: UserSession;
let newTask: Task;
describe("GET `/tasks`", () => {
  test("Sem usuário logado", async () => {
    const response = await fetch(API.task);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: "Não autorizado.",
      action: "Faça o login.",
    });
  });

  test("Com usuário logado porém sem `tasks` no banco", async () => {
    newUser = await createUser();
    session = await createSession(newUser);

    const response = await fetch(API.task, {
      headers: {
        Cookie: `session=${session.id}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(204);
  });

  test("Com usuário logado e uma `task` no banco", async () => {
    const task = {
      title: "Teste um",
      description: "Testa se a API devolverá essa task",
    };
    newTask = await createTask(task, newUser);

    const response = await fetch(API.task, {
      headers: {
        Cookie: `session=${session.id}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data[0]).toEqual({
      ...newTask,
      created_at: newTask.created_at.toISOString(),
      updated_at: newTask.updated_at.toISOString(),
    });
    expect(responseBody.message).toContain("1");
  });
});

describe("GET `/tasks/:id`", () => {
  test("Sem usuário logado", async () => {
    const response = await fetch(`${API.task}/${newTask.id}`);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      action: "Faça o login.",
      message: "Não autorizado.",
    });
  });

  test("Com usuário logado", async () => {
    const response = await fetch(`${API.task}/${newTask.id}`, {
      headers: {
        Cookie: `session=${session.id}`,
      },
    });
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      task: {
        ...newTask,
        created_at: newTask.created_at.toISOString(),
        updated_at: newTask.updated_at.toISOString(),
      },
    });
  });

  test("Com um usuário tentando buscar de outro usuário", async () => {
    const otherUser = await createUser();
    const otherSession = await createSession(otherUser);

    const response = await fetch(`${API.task}/${newTask.id}`, {
      headers: {
        Cookie: `session=${otherSession.id}`,
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: "Voce não tem permissão executar essa ação.",
    });
  });
});
