import { UserSession } from "@/generated/client.js";
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

describe("DELETE `/tasks`", () => {
  describe("Usuário anônimo", () => {
    test("Tentando deletar `task`", async () => {
      const fakeTaskId = crypto.randomUUID();

      const response = await fetch(`${API.task}/${fakeTaskId}`, {
        method: "DELETE",
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Não autorizado.",
        action: "Faça o login.",
      });
    });
  });
  describe("Usuário padrão", () => {
    let defaultUser: AuthenticatedUser;
    let defaultSession: UserSession;
    test("`task` com ID no formato inválido", async () => {
      const idInvalido = "id-no-formato-invalido";
      defaultUser = await createUser();
      defaultSession = await createSession(defaultUser);
      const response = await fetch(`${API.task}/${idInvalido}`, {
        method: "DELETE",
        headers: {
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

    test("`task` com ID no formato correto porém inexistente no banco", async () => {
      const fakeTaskId = crypto.randomUUID();

      const response = await fetch(`${API.task}/${fakeTaskId}`, {
        method: "DELETE",
        headers: {
          Cookie: `session=${defaultSession.id}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);
    });

    test(" e `task` com ID válido e existente", async () => {
      const task = await createTask(
        {
          title: "Teste deletar",
          description: "Enviando uma task existente para deletar!",
        },
        defaultUser,
      );

      const response = await fetch(`${API.task}/${task.id}`, {
        method: "DELETE",
        headers: {
          Cookie: `session=${defaultSession.id}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: `Task ${task.id} deletada com sucesso!`,
      });
    });

    test("Com um usuário tentando excluir `task` de outro usuário", async () => {
      const task = await createTask(
        {
          title: "Task do usuário padrão",
          description:
            "Enviando uma task existente para outro usuário tentar deletar!",
        },
        defaultUser,
      );

      const otherUser = await createUser();
      const otherSession = await createSession(otherUser);

      const response = await fetch(`${API.task}/${task.id}`, {
        method: "DELETE",
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
});
