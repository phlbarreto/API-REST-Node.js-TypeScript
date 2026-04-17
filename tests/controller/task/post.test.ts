import {
  API,
  createSession,
  createUser,
  waitForAllServices,
} from "$/orchestrator.js";
import { AuthenticatedUser, UserSession } from "~/models/session.js";

beforeAll(async () => {
  await waitForAllServices();
});

describe("POST `/tasks`", () => {
  test("Sem usuário logado", async () => {
    const response = await fetch(API.task, {
      method: "POST",
      body: JSON.stringify({
        title: "Usuário sem sessão",
        description: "O sistema deve bloquear esta ação!",
      }),
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
  test("Com usuário logado e todos os dados corretos", async () => {
    const newTask = {
      title: "Task com usuário logado",
      description: "O sistema deve aceitar esta ação!",
      status: "in_progress",
    };

    defaultUser = await createUser();
    defaultSession = await createSession(defaultUser);

    const response = await fetch(API.task, {
      method: "POST",
      body: JSON.stringify(newTask),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("message");
    expect(responseBody.data).toHaveProperty(
      "description",
      newTask.description,
    );
    expect(responseBody.data).toHaveProperty("title", newTask.title);
    expect(responseBody.data).toHaveProperty("id");
    expect(responseBody.data).toHaveProperty("created_at");
    expect(responseBody.data).toHaveProperty("updated_at");
    expect(responseBody.data).toHaveProperty("status");
    expect(responseBody.data.user_id).toBe(defaultUser.id);
  });

  test("Com usuário logado e sem a propriedade `title`", async () => {
    const newTaskWithNoTitle = {
      description: "O sistema deve negar esta ação!",
    };

    const response = await fetch(API.task, {
      method: "POST",
      body: JSON.stringify(newTaskWithNoTitle),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");

    expect(responseBody.error).toBe("Coluna 'title' é obrigatório!");
  });

  test("Com usuário logado e sem a propriedade `description`", async () => {
    const newTaskWithNoDescription = {
      title: "Bad request!",
    };

    const response = await fetch(API.task, {
      method: "POST",
      body: JSON.stringify(newTaskWithNoDescription),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");

    expect(responseBody.error).toBe("Coluna 'description' é obrigatória!");
  });

  test("Com usuário logado e sem as propriedades `title` e `description`", async () => {
    const emptyObject = {};

    const response = await fetch(API.task, {
      method: "POST",
      body: JSON.stringify(emptyObject),
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${defaultSession.id}`,
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");

    expect(responseBody.error).toBe(
      "Coluna 'title' é obrigatório! | Coluna 'description' é obrigatória!",
    );
  });

  test("Com usuário logado e com `status` inválido", async () => {
    const newTaskWithInvalidStatus = {
      title: "Tarefa com status invalido",
      description: "O sistema deve obrigatóriamente bloquear esta ação.",
      status: "status_inválido",
    };
    const response = await fetch(API.task, {
      method: "POST",
      body: JSON.stringify(newTaskWithInvalidStatus),
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
});
