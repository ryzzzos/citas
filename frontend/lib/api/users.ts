import type { User } from "@/types";

import { request } from "./client";

export async function getMe(): Promise<User> {
  return request<User>("/users/me");
}
