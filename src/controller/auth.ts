import { loginSchema } from "../zod/userSchema";
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { z } from "zod";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { registerSchema } from "../zod/userSchema";
import { createSession, validateSession } from "../utils/auth";
import { clearCookieResponse, cookieResponse } from "../utils/cookies";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (result.error) {
    const flatErr = z.flattenError(result.error);

    return res.status(400).json(flatErr.fieldErrors);
  }

  try {
    const password = await hashPassword(result.data.password);
    const data = {
      ...result.data,
      password,
    };
    const createUser = await prisma.user.create({ data });
    res
      .status(200)
      .json({ sucess: `Usuário ${createUser.name} criado com sucesso!` });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao registrar usuário", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (result.error) {
    const flatErr = z.flattenError(result.error);
    return res.status(400).json(flatErr.fieldErrors);
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (!user) {
    return res.status(401).json({ Error: "Email ou senha inválidos!" });
  }

  const isValid = await comparePassword(result.data.password, user?.password);

  if (!isValid) {
    return res.status(401).json({ Error: "Email ou senha inválidos!" });
  }
  const setCookie = cookieResponse(res);
  try {
    const session = await createSession(user.id);
    setCookie("session", session);
    res.json({ sucess: "Login realizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao efetuar login", error });
  }
};

export const validate = async (req: Request, res: Response) => {
  const sessionId = req.cookies.session
  console.log(sessionId);
  if (!sessionId) {
    return res.status(401).json({ Error: "Não autorizado!" });
  }
  
  const clearCookie = clearCookieResponse(res);
  try {
    const user = await validateSession(sessionId);

    if (!user) {
      clearCookie("session");
      return res.status(401).json({
        Error: "Sessão inválida, por favor efetue o login novamente!",
      });
    }
    const setCookie = cookieResponse(res);
    setCookie("session", sessionId);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Erro ao validar sessão" });
  }
};
