import { Request, Response, NextFunction } from "express";
import { CustomResponse } from "~/models/response";
import { AuthenticatedUser, validateSession } from "~/models/session";

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
  const response = new CustomResponse(res);
  const sessionId = req.cookies.session;
  if (!sessionId) {
    response.unauthorized("Não autorizado", "Faça o login.");
    return;
  }

  const userOrError = await validateSession(sessionId);

  if (!userOrError) {
    response.unauthorized(
      "Sessão inválida ou expirada.",
      "Por favor, faça o login novamente.",
    );
    return;
  }
  if (!req.context) {
    req.context = { user: userOrError };
  }

  req.context.user = userOrError;
  next();
}
