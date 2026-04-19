import {
  API,
  createSession,
  createUser,
  waitForAllServices,
} from "$/orchestrator.js";

import { env } from "~/config/env.js";

beforeAll(async () => {
  await waitForAllServices();
});

describe("GET `/user`", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Usuário anônimo", () => {
    test("Tentando buscar os dados", async () => {
      const response = await fetch(API.user);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Não autorizado.",
        action: "Verifique se está logado e tente novamente.",
      });
    });
  });

  describe("Usuário padrão", () => {
    test("Com Sessão vinculada", async () => {
      const newUser = await createUser();
      const session = await createSession(newUser);
      const response = await fetch(API.user, {
        headers: {
          Cookie: `session=${session.id}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.created_at.toISOString(),
          updated_at: newUser.updated_at.toISOString(),
        },
      });
    });

    test("Com sessão quase expirada", async () => {
      const horaAtual = new Date();
      const horaSessaoExpirada = new Date(
        horaAtual.getTime() - env.INACTIVITY_TIMEOUT / 2,
      );
      vi.setSystemTime(horaSessaoExpirada);

      const newUser = await createUser();
      const session = await createSession(newUser);

      vi.useRealTimers();
      const response = await fetch(API.user, {
        headers: {
          Cookie: `session=${session.id}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.created_at.toISOString(),
          updated_at: newUser.updated_at.toISOString(),
        },
      });

      expect(new Date(session.expires_at).getTime()).greaterThan(
        horaAtual.getTime(),
      );
      expect(session.created_at.getTime()).toBeLessThan(horaAtual.getTime());
    });

    test("Com sessão expirada", async () => {
      const horaAtual = new Date();
      const horaSessaoExpirada = new Date(
        horaAtual.getTime() - env.INACTIVITY_TIMEOUT,
      );
      vi.setSystemTime(horaSessaoExpirada);

      const newUser = await createUser();
      const session = await createSession(newUser);

      vi.useRealTimers();
      const response = await fetch(API.user, {
        headers: {
          Cookie: `session=${session.id}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Sessão inválida ou expirada.",
        action: "Por favor, realize o login novamente.",
      });
    });
  });
});
