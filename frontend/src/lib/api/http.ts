const RAW_BASE =
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined) ?? 'http://localhost:3001';
const API_BASE = `${RAW_BASE.replace(/\/$/, '')}/api`;

function buildUrl(path: string, params?: Record<string, unknown>) {
  const url = new URL(
    path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`,
  );
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) url.searchParams.append(k, String(item));
      } else {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

export interface ApiErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;
  constructor(status: number, payload: ApiErrorPayload | null, message?: string) {
    const msg =
      message ??
      (Array.isArray(payload?.message)
        ? payload.message.join('; ')
        : payload?.message ??
          `Request failed with status ${status}`);
    super(msg);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, unknown>;
  skipAuth?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  init: FetchOptions = {},
): Promise<T> {
  const { params, skipAuth = false, headers, body: rawBody, ...rest } = init;

  const finalHeaders: Record<string, string> = {
    accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  let finalBody: BodyInit | null | undefined = undefined;
  if (rawBody !== undefined && rawBody !== null) {
    if (rawBody instanceof FormData) {
      finalBody = rawBody;
    } else if (typeof rawBody === 'string') {
      finalBody = rawBody;
    } else {
      finalBody = JSON.stringify(rawBody);
      finalHeaders['content-type'] = 'application/json';
    }
  }

  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('onentree_token');
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchInit: RequestInit = {
    headers: finalHeaders,
    credentials: 'include',
    body: finalBody,
    ...(rest as RequestInit),
  };

  const res = await fetch(buildUrl(path, params), fetchInit);

  if (!res.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await res.json()) as ApiErrorPayload;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, payload);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
