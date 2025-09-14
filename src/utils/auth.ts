import { randomUUID } from "node:crypto";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const inactivityTimeout = 1000 * 60 * 60 * 2; //2h inatividade

export const createSession = async (userId: number) => {
  const sessionId = randomUUID();
  const now = new Date();
  try {
    await prisma.userSession.create({
      data: {
        id: sessionId,
        user_id: userId,
        expires_at: new Date(now.getTime() + inactivityTimeout),
        last_act_at: now,
      },
    });
    return sessionId;
  } catch (error) {
    return null;
  }
};

export const validateSession = async (sessionId: string) => {
  if (!sessionId) {
    return false;
  }

  const session = await prisma.userSession.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!session) {
    return false;
  }

  const userDb = await prisma.user.findUnique({
    where: {
      id: session.user_id,
    },
  });

  if (!userDb) {
    return false;
  }

  const user = {
    ...userDb,
    password: "",
  };

  const now = new Date();
  const lastActive = new Date(String(session.last_act_at));

  if (now.getTime() - lastActive.getTime() > inactivityTimeout) {
    await prisma.userSession.delete({
      where: {
        id: sessionId,
      },
    });
    return false;
  }

  await prisma.userSession.update({
    where: { id: sessionId },
    data: { last_act_at: now },
  });

  return user;
};
