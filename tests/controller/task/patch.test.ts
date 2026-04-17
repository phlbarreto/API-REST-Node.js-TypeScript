import {
  API,
  createSession,
  createTask,
  createUser,
  waitForAllServices,
} from "$/orchestrator.js";
import { AuthenticatedUser, UserSession } from "~/models/session.js";

beforeAll(async () => {
  await waitForAllServices();
});

describe("PATCH `/tasks/:id`", () => {
  test("Sem usuário logado", async () => {
    const fakeTaskId = crypto.randomUUID();

    const taskForUpdate = {
      title: "Atualização da task sem usuário",
      description: "O sistema deve bloquear essa ação!",
    };

    const response = await fetch(`${API.task}/${fakeTaskId}`, {
      method: "PATCH",
      body: JSON.stringify(taskForUpdate),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: "Não autorizado.",
      action: "Faça o login.",
    });
  });

  let defaultUser: AuthenticatedUser;
  let defaultSession: UserSession;
  test("Com usuário logado porém `task` com `ID` inválido", async () => {
    defaultUser = await createUser();
    defaultSession = await createSession(defaultUser);
    const invalidId = "id-no-formato-invalido";

    const taskForUpdate = {
      title: "Atualização com ID inválido",
      description: "O sistema deve bloquear essa ação!",
    };

    const response = await fetch(`${API.task}/${invalidId}`, {
      method: "PATCH",
      body: JSON.stringify(taskForUpdate),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "Id da task deve ser do tipo UUID.",
    });
  });

  test("Com usuário logado porém `task` com `ID` inexistente no banco", async () => {
    const fakeTaskId = crypto.randomUUID();

    const taskForUpdate = {
      title: "Atualização da task sem usuário",
      description: "O sistema deve bloquear essa ação!",
    };

    const response = await fetch(`${API.task}/${fakeTaskId}`, {
      method: "PATCH",
      body: JSON.stringify(taskForUpdate),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(204);
  });

  test("Com usuário logado e `task` com `ID` existente no banco", async () => {
    const task = {
      title: "Atualização da task",
      description: "O sistema deve aceitar essa ação!",
    };
    const taskForUpdate = await createTask(task, defaultUser);

    const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Task atualizada!",
        description: "O sistema aceitou a atualização!",
        status: "done",
      }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.data.title).not.toBe(task.title);
    expect(responseBody.data.description).not.toBe(task.description);
    expect(new Date(responseBody.data.updated_at).getTime()).toBeGreaterThan(
      new Date(responseBody.data.created_at).getTime(),
    );
  });

  test("Com usuário logado e `task` com `status` inexistente", async () => {
    const task = {
      title: "Atualização da task",
      description: "O sistema deve aceitar essa ação!",
    };

    const taskForUpdate = await createTask(task, defaultUser);

    const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "este_status_nao_existe",
      }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: 'Opção inválida: esperada uma das "pending"|"in_progress"|"done"',
    });
  });

  test("Com um usuário tentando alterar `task` de outro usuário", async () => {
    const task = {
      title: "Criação da task",
      description: "O sistema deve aceitar essa ação!",
    };

    const taskForUpdate = await createTask(task, defaultUser);

    const otherUser = await createUser();
    const otherSession = await createSession(otherUser);

    const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Alterado por outro usuário?",
        description: "O sistema não pode aceitar esta ação!",
      }),
      headers: {
        "Content-Type": "application/json",
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
