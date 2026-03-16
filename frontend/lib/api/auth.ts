import type { AuthToken, User } from "@/types";

import { clearAccessToken, request, setAccessToken } from "./client";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "business_owner";
}

export async function login(email: string, password: string): Promise<AuthToken> {
  const token = await request<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAccessToken(token.access_token);
  return token;
}

export async function register(data: RegisterInput): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout(): void {
  clearAccessToken();
}
