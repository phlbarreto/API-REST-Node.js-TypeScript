import { CookieOptions } from "express";
import { CustomResponse } from "./customResponse.js";
import { env } from "~/config/env.js";

export class CookieResponse extends CustomResponse {
  private cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "none",
  };

  setCookie(name: string, value: any) {
    this.response.cookie(name, value, {
      ...this.cookieOptions,
      maxAge: env.INACTIVITY_TIMEOUT,
    });
  }

  clearCookie(name: string) {
    this.response.clearCookie(name, this.cookieOptions);
  }
}
