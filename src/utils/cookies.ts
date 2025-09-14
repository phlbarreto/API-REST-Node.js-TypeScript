import { Response, CookieOptions } from "express";
import dotenv from "dotenv";
dotenv.config();
const inactivityTimeout = 1000 * 60 * 60 * 2; //2h

export const cookieResponse = (res: Response) => {
  return (name: string, value: any, options?: CookieOptions) => {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: inactivityTimeout,
      ...options,
    });
  };
};

export const clearCookieResponse = (res: Response) => {
  return (name: string, options?: Parameters<Response["clearCookie"]>[1]) => {
    res.clearCookie(name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      ...options,
    });
  };
};
