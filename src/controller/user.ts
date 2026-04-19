import { Request, Response } from "express";
import { loginSchema } from "~/zod/userSchema.js";
import { registerSchema } from "~/zod/userSchema.js";
import { AuthenticatedUser, sessionModel } from "~/models/session.js";
import { userModel } from "~/models/user.js";
import { CookieResponse } from "~/models/cookieResponse.js";

export const register = async (req: Request, res: Response) => {
  const response = new CookieResponse(res);
  const result = registerSchema.safeParse(req.body);

  if (result.error) {
    response.badRequest(result.error);
    return;
  }

  try {
    const registeredUser = await userModel.create(result.data);
    response.created({
      message: `Usuário '${registeredUser.name}' criado com sucesso!`,
    });
  } catch (error: any) {
    console.error("Erro ao registrar usuário: ", error);
    response.internalServerError();
  }
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  const response = new CookieResponse(res);
  if (result.error) {
    response.badRequest(result.error);
    return;
  }
  try {
    const user = await userModel.authenticateUser(result.data);
    if (!user) {
      response.unauthorized(
        "Verifique os dados enviados e tente novamente",
        "Email ou senha inválido",
      );
      return;
    }
    const session = await sessionModel.create(user.id);
    new CookieResponse(res).setCookie("session", session.id);
    response.created({ message: "Usuário autenticado!" });
  } catch (error) {
    console.error("Erro insperado ao efetuar login: ", error);
    response.internalServerError();
  }
};

export const getUser = async (
  req: Request,
  res: Response,
): Promise<AuthenticatedUser | undefined> => {
  const sessionId = req.cookies.session;
  const response = new CookieResponse(res);
  if (!sessionId) {
    response.unauthorized("Verifique se está logado e tente novamente.");
    return;
  }

  try {
    const user = await sessionModel.validate(sessionId);

    if (!user) {
      response.clearCookie("session");
      response.unauthorized(
        "Por favor, realize o login novamente.",
        "Sessão inválida ou expirada.",
      );
      return;
    }
    response.setCookie("session", sessionId);
    response.success({ user });
  } catch (error) {
    console.error("Erro ao validar sessão: ", error);
    response.internalServerError();
  }
};
