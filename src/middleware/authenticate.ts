import { Request, Response, NextFunction } from "express";
import { CookieResponse } from "~/models/cookieResponse.js";
import { AuthenticatedUser, validateSession } from "~/models/session.js";

export interface AuthenticatedRequest extends Request {
  context?: {
    user: AuthenticatedUser;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const response = new CookieResponse(res);
  const sessionId = req.cookies.session;
  if (!sessionId) {
    response.unauthorized("Faça o login.");
    return;
  }

  const userOrError = await validateSession(sessionId);

  if (!userOrError) {
    response.clearCookie("session");
    response.unauthorized(
      "Por favor, faça o login novamente.",
      "Sessão inválida ou expirada.",
    );
    return;
  }
  if (!req.context) {
    req.context = { user: userOrError };
  }

  req.context.user = userOrError;
  next();
}
