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
  describe("Usuário anônimo", () => {
    test("Tentando criar tarefa", async () => {
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
  });

  describe("Usuário padrão", () => {
    let defaultUser: AuthenticatedUser;
    let defaultSession: UserSession;
    test("Todos os dados corretos", async () => {
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

    test("Sem a propriedade `title`", async () => {
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

    test("Sem a propriedade `description`", async () => {
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

    test("Sem as propriedades `title` e `description`", async () => {
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

    test("Com `status` inválido", async () => {
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
        error:
          'Opção inválida: esperada uma das "pending"|"in_progress"|"done"',
      });
    });

    test("Com `title` menor que 5 caracteres", async () => {
      const response = await fetch(API.task, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          title: "Pequ",
          description: "Titulo muito pequeno, sistema deve bloquear!",
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

      const response = await fetch(API.task, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          title,
          description: "Titulo muito grande, sistema deve bloquear!",
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
      const response = await fetch(API.task, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          title: "Descrição pequena!",
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

      const response = await fetch(API.task, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${defaultSession.id}`,
        },
        body: JSON.stringify({
          title: "Descrição muito grande!",
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
