import { LoginInput, UserInput } from "~/zod/userSchema.js";
import { createSession } from "~/models/session.js";
import { comparePassword, hashPassword } from "./password.js";
import { prisma } from "~/infra/database.js";

export const registerUser = async (userInputValues: UserInput) => {
  const password = await hashPassword(userInputValues.password);
  const newUser = {
    ...userInputValues,
    password,
  };
  return await prisma.user.create({ data: newUser });
};

export const login = async (userInputValues: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: userInputValues.email },
  });

  if (!user) return false;

  const isValid = await comparePassword(
    userInputValues.password,
    user.password,
  );

  if (!isValid) return false;

  const session = await createSession(user.id);
  if (!session) return false;

  return session;
};
