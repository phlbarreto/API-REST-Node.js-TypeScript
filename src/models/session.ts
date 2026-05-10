import { randomUUID } from "node:crypto";
import { env } from "~/config/env.js";
import { prisma } from "~/infra/database.js";
import { BaseModel } from "./base.js";
import { UserSessionDelegate } from "@/generated/models.js";
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

  private getExpiresAt() {
    const now = new Date();
    const expires_at = new Date(now.getTime() + env.INACTIVITY_TIMEOUT);
    return { now, expires_at };
  }

  async create(user_id: string): Promise<UserSession> {
    const id = randomUUID();
    const { now, expires_at } = this.getExpiresAt();
    return await this.createOne({
      id,
      user_id,
      expires_at,
      last_active_at: now,
    });
  }

  async findOneValid(sessionId: string): Promise<UserSession | false> {
    const sessionObject: UserSession = await this.findUnique({
      where: { id: sessionId },
    });

    if (!sessionObject) return false;

    const now = new Date();
    const isExceededTime = now.getTime() > sessionObject.expires_at.getTime();

    if (isExceededTime) return false;

    return sessionObject;
  }

  async validate(sessionId: string): Promise<AuthenticatedUser | false> {
    const sessionObject = await this.findOneValid(sessionId);
    if (!sessionObject) return false;

    const { now, expires_at } = this.getExpiresAt();
    await this.updateOne(
      { id: sessionId },
      { last_active_at: now, expires_at },
    );

    const user = await this.userModel.findOne(sessionObject.user_id);
    if (!user) return false;

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

  async invalidate(sessionId: string) {
    const sessionObject = await this.findOneValid(sessionId);
    if (!sessionObject) return false;

    await this.updateOne({ id: sessionId }, { expires_at: new Date() });
    return true;
  }
}

export const sessionModel = new SessionModel(prisma.userSession, userModel);
