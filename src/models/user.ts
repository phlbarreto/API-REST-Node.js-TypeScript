import { LoginInput, UserInput } from "~/zod/userSchema.js";
import { comparePassword, hashPassword } from "./password.js";
import { prisma } from "~/infra/database.js";
import { BaseModel } from "./base.js";
import { UserDelegate } from "@/generated/models.js";
import { AuthenticatedUser } from "./session.js";

class UserModel extends BaseModel<UserDelegate> {
  constructor(model: UserDelegate) {
    super(model);
  }

  async create(userInputValues: UserInput): Promise<AuthenticatedUser> {
    userInputValues.password = await hashPassword(userInputValues.password);
    return await this.createOne(userInputValues);
  }

  async authenticateUser(userInputValues: LoginInput) {
    const user = await this.findUnique({
      where: { email: userInputValues.email },
    });
    if (!user) return false;

    const isValid = await comparePassword(
      userInputValues.password,
      user.password,
    );
    if (!isValid) return false;

    return user;
  }

  async findOne(id: string) {
    return await this.findFirst({ where: { id } });
  }
}

export const userModel = new UserModel(prisma.user);
export type UserModelClass = UserModel;
