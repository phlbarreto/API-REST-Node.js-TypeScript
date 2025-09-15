import { Request, Response, NextFunction } from "express";
import { validateSession } from "../utils/auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies.session;

  if (!sessionId) {
    res.status(401).json({ message: "Não autorizado" });
    return;
  }

  const session = await validateSession(sessionId);

  if (!session) {
    res.status(403).json({ message: "Sessão inválida ou expirada" });
    return;
  }
  req.user = { id: session.id.toString() };
  next();
}
