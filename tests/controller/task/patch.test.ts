import { randomUUID } from "node:crypto";
import {
  API,
  createSession,
  createTask,
  createUser,
  waitForAllServices,
} from "$/orchestrator.js";
import { AuthenticatedUser, UserSession } from "~/models/session.js";
import { Task } from "@/generated/client.js";

beforeAll(async () => {
  await waitForAllServices();
});

describe("PATCH `/tasks/:id`", () => {
  describe("Usuário anônimo", () => {
    test("Tentando alterar tarefa", async () => {
      const fakeTaskId = randomUUID();

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
  });

  describe("Usuário padrão", () => {
    let defaultUser: AuthenticatedUser;
    let defaultSession: UserSession;
    let taskForUpdate: Task;
    test("`task` com `ID` inválido", async () => {
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

    test("`task` com `ID` inexistente no banco", async () => {
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

    test("`task` com `ID` existente no banco", async () => {
      const task = {
        title: "Atualização da task",
        description: "O sistema deve aceitar essa ação!",
      };
      taskForUpdate = await createTask(task, defaultUser);

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

    test("`task` com `status` inexistente", async () => {
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
        error:
          'Opção inválida: esperada uma das "pending"|"in_progress"|"done"',
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

    test("Com `title` menor que 5 caracteres", async () => {
      const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          title: "Pequ",
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: "O título deve conter no mínimo 5 caracteres.",
      });
    });

    test("Com `title` maior que 200 caracteres", async () => {
      const title =
        "Exploração Avançada de Parâmetros de Validação para Títulos e Descrições em Arquiteturas de Microserviços Modernas que Utilizam TypeScript e Node.js para Garantir a Integridade Total dos Dados na Nuvem.";

      const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          title,
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: "O título deve conter no máximo 200 caracteres.",
      });
    });

    test("Com `description` menor que 10 caracteres", async () => {
      const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          description: "Pequena",
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: "A descrição deve conter no mínimo 10 caracteres.",
      });
    });

    test("Com `description` maior que 500 caracteres", async () => {
      const description =
        "A implementação de limites rigorosos de caracteres em campos de texto é uma prática indispensável para o desenvolvimento de APIs resilientes e escaláveis. Ao definir um teto para a descrição, o desenvolvedor previne abusos de armazenamento e garante que a transferência de dados via JSON permaneça leve, otimizando o tempo de resposta do servidor. Além disso, essa restrição facilita a padronização estética na interface do usuário, evitando que componentes de cartão ou listas sofram deformações visuais inesperadas. No contexto de SEO, manter a descrição concisa auxilia os motores de busca a indexarem corretamente o resumo do conteúdo, refletindo diretamente na relevância do projeto.";

      const response = await fetch(`${API.task}/${taskForUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          description,
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: "A descrição deve conter no máximo 500 caracteres.",
      });
    });
  });
});
