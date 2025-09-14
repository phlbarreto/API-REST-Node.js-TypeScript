import { genSalt, hash, compare } from "bcrypt";

export const hashPassword = async (password: string) => {
  try {
    const salt = await genSalt(10);
    return await hash(password, salt);
  } catch (error) {
    throw new Error("Erro ao hashear password");
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Erro ao comparar password");
  }
};
