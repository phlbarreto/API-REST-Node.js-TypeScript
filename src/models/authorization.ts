import { Task } from "@/generated/client";
import { AuthenticatedUser } from "./session";

export function canRequest(user: AuthenticatedUser, task: Task): boolean {
  let authorized = false;
  if (user.id === task.user_id) {
    authorized = true;
  }

  return authorized;
}
