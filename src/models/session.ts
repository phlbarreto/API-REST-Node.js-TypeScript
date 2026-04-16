import { randomUUID } from "node:crypto";
import { env } from "~/config/env";
import { prisma } from "~/infra/database";

export const createSession = async (userId: string) => {
  const sessionId = randomUUID();
  const now = new Date();

  await prisma.userSession.create({
    data: {
      id: sessionId,
      user_id: userId,
      expires_at: new Date(now.getTime() + env.INACTIVITY_TIMEOUT),
      last_active_at: now,
    },
  });
  return sessionId;
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

  const { email, id, name, createdAt, updatedAt } = userDb;
  const secureObjectValue = { id, email, name, createdAt, updatedAt };
  return secureObjectValue;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};
