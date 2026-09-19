/**
 * StockPulse Centralized API Client
 * Provides type-safe HTTP requests with timeout handling, standard headers, and error parsing.
 */

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private defaultTimeoutMs: number = 8000;

  async request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const { timeoutMs = this.defaultTimeoutMs, headers = {}, ...customConfig } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      method: customConfig.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
      signal: controller.signal,
      ...customConfig,
    };

    try {
      const response = await fetch(endpoint, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          // Response body is not JSON
        }
        throw new ApiError(
          errorData?.error || errorData?.detail || `HTTP error! Status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiError(`Request timeout after ${timeoutMs}ms for ${endpoint}`, 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err?.message || 'Network error', 0);
    }
  }

  get<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: any, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient();
