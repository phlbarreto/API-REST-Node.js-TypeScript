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

describe("POST `/login`", () => {
  let defaultUser: AuthenticatedUser;
  test("Com todos os dados corretos", async () => {
    defaultUser = await createUser();
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({
        email: defaultUser.email,
        password: "ValidPassword",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toEqual({ message: "Usuário autenticado!" });
  });

  test("Com `password` inválido", async () => {
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({
        email: defaultUser.email,
        password: "InvalidPassword",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: "Email ou senha inválido",
      action: "Verifique os dados enviados e tente novamente",
    });
  });

  test("Com `email` inexistente", async () => {
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({
        email: "email@inexistente.com",
        password: "InvalidPassword",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: "Email ou senha inválido",
      action: "Verifique os dados enviados e tente novamente",
    });
  });

  test("Com `email` inválido", async () => {
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({
        email: "emailinvalido.com",
        password: "InvalidPassword",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "Email não enviado ou inválido.",
    });
  });

  test("Sem a propriedade `email`", async () => {
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({
        password: "InvalidPassword",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "Email não enviado ou inválido.",
    });
  });

  test("Sem a propriedade `password`", async () => {
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({
        email: defaultUser.email,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "Senha obrigatória.",
    });
  });

  test("Sem as propriedades `email` e `password`", async () => {
    const response = await fetch(API.login, {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "Email não enviado ou inválido. | Senha obrigatória.",
    });
  });
});
