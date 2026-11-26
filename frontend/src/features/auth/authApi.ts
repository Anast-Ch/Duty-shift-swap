import type { Role, User } from "../../shared/types";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const TOKENS_KEY = "duty-shift-swap.tokens";

export class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`API request failed: ${status}`);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    throw new ApiError(response.status);
  }
  return response;
}

function post(body: object): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function readTokens(): Tokens | null {
  const value = localStorage.getItem(TOKENS_KEY);
  if (!value) return null;
  try {
    const tokens = JSON.parse(value) as Partial<Tokens> | null;
    if (
      tokens &&
      typeof tokens.accessToken === "string" &&
      tokens.accessToken &&
      typeof tokens.refreshToken === "string" &&
      tokens.refreshToken
    ) {
      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    }
  } catch {
    // An invalid stored value is not an authenticated session.
  }
  localStorage.removeItem(TOKENS_KEY);
  return null;
}

export function saveTokens(tokens: Tokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY);
}

export async function registerRequest(name: string, email: string, password: string): Promise<void> {
  await request("/auth/register", post({ name, email, password }));
}

export async function loginRequest(email: string, password: string): Promise<Tokens> {
  const response = await request("/auth/login", post({ email, password }));
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("access_token" in data) ||
    typeof data.access_token !== "string" ||
    !("refresh_token" in data) ||
    typeof data.refresh_token !== "string"
  ) {
    throw new Error("Некорректный ответ сервера");
  }
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

export async function refreshRequest(refreshToken: string, signal?: AbortSignal): Promise<string> {
  const response = await request("/auth/refresh", {
    ...post({ refresh_token: refreshToken }),
    signal,
  });
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("access_token" in data) || typeof data.access_token !== "string") {
    throw new Error("Некорректный ответ сервера");
  }
  return data.access_token;
}

export async function currentUserRequest(accessToken: string, signal?: AbortSignal): Promise<User> {
  const response = await request("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "number" ||
    !("name" in data) ||
    typeof data.name !== "string" ||
    !("email" in data) ||
    typeof data.email !== "string" ||
    !("role" in data) ||
    (data.role !== "EMPLOYEE" && data.role !== "SENIOR")
  ) {
    throw new Error("Некорректный ответ сервера");
  }
  return { id: String(data.id), name: data.name, email: data.email, role: data.role as Role };
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await request("/auth/logout", post({ refresh_token: refreshToken }));
}
