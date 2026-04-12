import { LoginInput, UserInput } from "~/zod/userSchema";
import { createSession } from "~/models/session";
import { comparePassword, hashPassword } from "./password";
import { prisma } from "~/infra/database";

export const registerUser = async (userInputValues: UserInput) => {
  const password = await hashPassword(userInputValues.password);
  const newUser = {
    ...userInputValues,
    password,
  };
  return await prisma.user.create({ data: newUser });
};

export const login = async (userInputValues: LoginInput) => {
  const result = {
    session: null,
    success: false,
  };

  const user = await prisma.user.findUnique({
    where: { email: userInputValues.email },
  });

  if (!user) {
    return result;
  }

  const isValid = await comparePassword(
    userInputValues.password,
    user.password,
  );

  if (!isValid) {
    return result;
  }

  const session = await createSession(user.id);

  return { session, success: true };
};
