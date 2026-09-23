const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api/v1';

const ACCESS_TOKEN_KEY = 'surtiweb_access_token';
const REFRESH_TOKEN_KEY = 'surtiweb_refresh_token';

export class ApiError extends Error {
  status: number;
  fields: Record<string, unknown> | null;
  constructor(status: number, message: string, fields: Record<string, unknown> | null = null) {
    super(message);
    this.status = status;
    this.fields = fields;
  }

  hasFieldError(field: string): boolean {
    return !!this.fields && field in this.fields;
  }
}

export function getTokens() {
  try {
    return {
      access: localStorage.getItem(ACCESS_TOKEN_KEY),
      refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  } catch {
    return { access: null, refresh: null };
  }
}

export function setTokens(access: string, refresh: string) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } catch {
    // localStorage no disponible (modo privado, etc.) — la sesión no persiste entre recargas
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // sin acción — nada que limpiar si localStorage no está disponible
  }
}

const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté corriendo.';

async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;

  const response = await safeFetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    clearTokens();
    return null;
  }
  const data = await response.json();
  setTokens(data.access, refresh);
  return data.access as string;
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const buildHeaders = (): HeadersInit => {
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const { access } = getTokens();
      if (access) base.Authorization = `Bearer ${access}`;
    }
    return { ...base, ...headers };
  };

  let response = await safeFetch(`${API_BASE_URL}${path}`, { ...rest, headers: buildHeaders() });

  if (response.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      response = await safeFetch(`${API_BASE_URL}${path}`, { ...rest, headers: buildHeaders() });
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail ?? extractFirstFieldError(body) ?? `Error ${response.status} al conectar con el servidor.`;
    const fields = body && typeof body === 'object' && !('detail' in body) ? (body as Record<string, unknown>) : null;
    throw new ApiError(response.status, message, fields);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

function extractFirstFieldError(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  for (const value of Object.values(body as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    if (typeof value === 'string') return value;
  }
  return null;
}
