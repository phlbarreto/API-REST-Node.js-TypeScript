import { hash, compare } from "bcrypt";
import { env } from "~/config/env";

export const hashPassword = async (password: string) => {
  const salt = genSalt();
  return await hash(password, salt);

  function genSalt() {
    return env.isProduction ? 14 : 1;
  }
};

export const comparePassword = async (
  providedPassword: string,
  storedPassword: string,
) => {
  return await compare(providedPassword, storedPassword);
};
