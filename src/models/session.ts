import { randomUUID } from "node:crypto";
import { env } from "~/config/env.js";
import { prisma } from "~/infra/database.js";

export const createSession = async (userId: string) => {
  const sessionId = randomUUID();
  const now = new Date();

  const session = await prisma.userSession.create({
    data: {
      id: sessionId,
      user_id: userId,
      expires_at: new Date(now.getTime() + env.INACTIVITY_TIMEOUT),
      last_active_at: now,
    },
  });
  return session;
};

export const validateSession = async (sessionId: string) => {
  const session = await prisma.userSession.findUnique({
    where: {
      id: sessionId,
    },
  });
  if (!session) return false;

  const userDb = await prisma.user.findUnique({
    where: {
      id: session.user_id,
    },
  });
  if (!userDb) return false;

  const now = new Date();
  const lastActive = new Date(String(session.last_active_at));

  if (now.getTime() - lastActive.getTime() > env.INACTIVITY_TIMEOUT)
    return false;

  await prisma.userSession.update({
    where: { id: sessionId },
    data: { last_active_at: now },
  });

  const { email, id, name, created_at, updated_at } = userDb;
  const secureObjectValue = { id, email, name, created_at, updated_at };
  return secureObjectValue;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type UserSession = Awaited<ReturnType<typeof createSession>>;
