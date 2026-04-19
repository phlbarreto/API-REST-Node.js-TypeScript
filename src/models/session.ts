import { randomUUID } from "node:crypto";
import { env } from "~/config/env.js";
import { prisma } from "~/infra/database.js";
import { BaseModel } from "./base.js";
import { UserDelegate, UserSessionDelegate } from "@/generated/models.js";
import { userModel, UserModelClass } from "./user.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type UserSession = {
  id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
  last_active_at: Date;
};

class SessionModel extends BaseModel<UserSessionDelegate> {
  constructor(
    model: UserSessionDelegate,
    private userModel: UserModelClass,
  ) {
    super(model);
    this.userModel = userModel;
  }

  async create(user_id: string): Promise<UserSession> {
    const id = randomUUID();
    const now = new Date();
    const expires_at = new Date(now.getTime() + env.INACTIVITY_TIMEOUT);

    return await this.createOne({
      id,
      user_id,
      expires_at,
      last_active_at: now,
    });
  }

  async validate(sessionId: string): Promise<AuthenticatedUser | false> {
    const sessionObject: UserSession = await this.findUnique({
      where: { id: sessionId },
    });
    if (!sessionObject) return false;

    const user = await this.userModel.findOne(sessionObject.user_id);
    if (!user) return false;

    const now = new Date();
    const lastActive = new Date(String(sessionObject.last_active_at));

    if (now.getTime() - lastActive.getTime() > env.INACTIVITY_TIMEOUT)
      return false;

    await this.updateOne({ id: sessionId }, { last_active_at: now });

    const { email, id, name, created_at, updated_at } = user;
    const secureObjectValue: AuthenticatedUser = {
      id,
      email,
      name,
      created_at,
      updated_at,
    };
    return secureObjectValue;
  }
}

export const sessionModel = new SessionModel(prisma.userSession, userModel);
