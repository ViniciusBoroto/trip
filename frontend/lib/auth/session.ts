import { ApiClientError, apiRequest, type RequestOptions } from "@/lib/api/client";
import { refreshSession } from "@/services/auth";

let accessToken: string | null = null;
let refreshInFlight: Promise<string> | null = null;

export function readAccessToken() {
  return accessToken;
}

export function writeAccessToken(token: string | null) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function refreshAccessToken() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const response = await refreshSession();

    if (!response || !response.ok || !response.accessToken) {
      clearAccessToken();
      throw new ApiClientError(response?.message || "Session refresh failed.", 401, response);
    }

    writeAccessToken(response.accessToken);
    return response.accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function authenticatedRequest<T>(
  path: string,
  options: RequestOptions = {},
  allowRefresh = true,
): Promise<T | null> {
  const token = readAccessToken();

  if (!token) {
    throw new ApiClientError("Authentication required.", 401, null);
  }

  try {
    return await apiRequest<T>(path, withAuthorization(options, token));
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401 || !allowRefresh) {
      throw error;
    }

    const nextToken = await refreshAccessToken();
    return apiRequest<T>(path, withAuthorization(options, nextToken));
  }
}

function withAuthorization(options: RequestOptions, token: string): RequestOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}
