const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type QueryValue = string | number | boolean | null | undefined;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
}

export function toQueryString(params: object): string {
  const entries = Object.entries(params as Record<string, QueryValue>)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => [key, String(value)]);

  return new URLSearchParams(entries).toString();
}

async function parseErrorDetail(response: Response): Promise<string> {
  const fallback = response.statusText || "Request failed";
  const payload = await response.json().catch(() => null);

  if (!payload || typeof payload !== "object") return fallback;

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: unknown; loc?: unknown };
    const msg = typeof first?.msg === "string" ? first.msg : null;
    const loc = Array.isArray(first?.loc)
      ? first.loc
          .map((part) => String(part))
          .join(".")
      : null;

    if (msg && loc) return `${loc}: ${msg}`;
    if (msg) return msg;
  }

  return fallback;
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => headers.set(key, value));
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseErrorDetail(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
