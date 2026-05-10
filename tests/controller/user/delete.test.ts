import { API, createSession, createUser } from "$/orchestrator.js";
import { env } from "~/config/env.js";

describe("DELETE `/user`", () => {
  describe("Usuário anônimo", () => {
    test("Tentando fazer a request", async () => {
      const response = await fetch(API.user, {
        method: "DELETE",
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Faça o login.",
        message: "Não autorizado.",
      });
    });
  });

  describe("Usuário padrão", () => {
    test("Com sessão válida", async () => {
      const defaultUser = await createUser();
      const defaultSession = await createSession(defaultUser);

      const response = await fetch(API.user, {
        method: "DELETE",
        headers: {
          Cookie: `session=${defaultSession.id}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({ message: "Sessão encerrada!" });
    });

    test("Com sessão quase expirada", async () => {
      const horaAtual = new Date();
      const horaSessaoExpirada = new Date(
        horaAtual.getTime() - env.INACTIVITY_TIMEOUT / 2,
      );
      vi.setSystemTime(horaSessaoExpirada);

      const newUser = await createUser();
      const almostExpiredSession = await createSession(newUser);

      vi.useRealTimers();
      const response = await fetch(API.user, {
        method: "DELETE",
        headers: {
          Cookie: `session=${almostExpiredSession.id}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({ message: "Sessão encerrada!" });
    });

    test("Com sessão expirada", async () => {
      const horaAtual = new Date();
      const horaSessaoExpirada = new Date(
        horaAtual.getTime() - env.INACTIVITY_TIMEOUT,
      );
      vi.setSystemTime(horaSessaoExpirada);

      const newUser = await createUser();
      const expiredSession = await createSession(newUser);

      vi.useRealTimers();
      const response = await fetch(API.user, {
        method: "DELETE",
        headers: {
          Cookie: `session=${expiredSession.id}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Verifique se está logado e tente novamente.",
        message: "Sessão expirada.",
      });

      const response2 = await fetch(API.user, {
        headers: {
          Cookie: `session=${expiredSession.id}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        action: "Por favor, realize o login novamente.",
        message: "Sessão inválida ou expirada.",
      });
    });
  });
});
