import { Request, Response } from "express";
import { loginSchema } from "~/zod/userSchema";
import { registerSchema } from "~/zod/userSchema";
import { validateSession } from "~/models/session";
import { registerUser, login } from "~/models/user";
import { CustomResponse } from "~/models/response";
import { CookieResponse } from "~/models/cookieResponse";

export const register = async (req: Request, res: Response) => {
  const response = new CustomResponse(res);
  const result = registerSchema.safeParse(req.body);

  if (result.error) {
    response.badRequest(result.error);
    return;
  }

  try {
    const registeredUser = await registerUser(result.data);
    response.success(`Usuário '${registeredUser.name}' criado com sucesso!`);
  } catch (error: any) {
    console.error("Erro ao registrar usuário: ", error);
    response.internalServerError();
  }
};

export const authentication = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  const response = new CustomResponse(res);
  if (result.error) {
    response.badRequest(result.error);
    return;
  }
  try {
    const sessionObject = await login(result.data);
    if (!sessionObject.success) {
      response.unauthorized(
        "Email ou senha inválido",
        "Verifique os dados enviados e tente novamente",
      );
      return;
    }

    new CookieResponse(res).setCookie("session", sessionObject.session);
    response.success("Login efetuado com sucesso");
  } catch (error) {
    console.error("Erro insperado ao efetuar login: ", error);
    response.internalServerError();
  }
};

export const getUser = async (req: Request, res: Response) => {
  const sessionId = req.cookies.session;
  const response = new CookieResponse(res);
  if (!sessionId) {
    response.unauthorized(
      "Não autorizado.",
      "Verifique se está logado e tente novamente.",
    );
    return;
  }

  try {
    const userOrError = await validateSession(sessionId);

    if (!userOrError) {
      response.clearCookie("session");
      response.unauthorized(
        "Sessão inválida ou expirada.",
        "Por favor, realize o login novamente.",
      );
      return;
    }
    response.setCookie("session", sessionId);
    response.success("Sessão válida!", userOrError);
  } catch (error) {
    console.error("Erro ao validar sessão: ", error);
    response.internalServerError();
  }
};
