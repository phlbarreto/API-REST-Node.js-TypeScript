import { API, clearDatabase, waitForAllServices } from "$/orchestrator.js";
import crypto from "node:crypto";

beforeAll(async () => {
  await clearDatabase();
  await waitForAllServices();
});

describe("POST `/user`", () => {
  test("Com todos os dados corretos", async () => {
    const userData = {
      name: "Teste Usuario",
      email: "email@teste.com",
      password: "senha@teste",
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);
    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("message");
    expect(responseBody.message).toContain(userData.name);
  });

  test("Com `email` inválido", async () => {
    const userData = {
      name: "Email Inválido",
      email: "emailnaovalido",
      password: "email@invalido",
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody).toEqual({ error: "Email não enviado ou inválido." });
  });

  test("Com `nome` excedendo 30 caracteres", async () => {
    const userData = {
      name: "Nome do Usuario Muito Grande e Inválido ",
      email: "nome@invalido.com",
      password: "nome-invalido",
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody).toEqual({
      error: "Nome deve ter no máximo 30 caracteres.",
    });
  });

  test("Com `senha` excedendo 60 caracteres", async () => {
    const password = crypto.randomBytes(31).toString("hex"); //gera um string de 62 caracteres

    const userData = {
      name: "Com Senha Inválida ",
      email: "senha@invalida.com",
      password,
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody).toEqual({
      error: "Senha deve ter no máximo 60 caracteres.",
    });
  });

  test("Sem a propriedade `name`", async () => {
    const userData = {
      email: "usuario@sem-nome.com",
      password: "semNomeDeUsuario",
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody).toEqual({ error: "Nome é obrigatório." });
  });

  test("Sem a propriedade `email`", async () => {
    const userData = {
      name: "Usuario Sem Email",
      password: "semNomeDeUsuario",
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody).toEqual({ error: "Email não enviado ou inválido." });
  });

  test("Sem a propriedade `password`", async () => {
    const userData = {
      name: "Usuario Sem Senha",
      email: "usuario@sem-senha.com",
    };

    const response = await fetch(API.user, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody).toEqual({ error: "Senha é obrigátoria." });
  });
});
