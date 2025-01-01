import type { paths, operations } from '@/types/apiSchema';
import { authService } from '@/services/authService.js';

// Helper type to extract path parameters from a URL
type ExtractPathParams<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractPathParams<Rest>
    : never;

// Helper type to get operation type from path and method
type GetOperationType<
  P extends keyof paths,
  M extends keyof paths[P]
> = paths[P][M] extends operations[keyof operations] ? paths[P][M] : never;

// Type for request configuration
type RequestConfig<P extends keyof paths, M extends keyof paths[P]> = {
  path: P;
  method: M;
  pathParams?: GetOperationType<P, M>['parameters']['path'];
  queryParams?: GetOperationType<P, M>['parameters']['query'];
  body?: GetOperationType<P, M> extends {
    requestBody: { content: { 'application/json': infer T } };
  }
    ? T
    : never;
};

export class APIClient {
  constructor(private basePath: string) {}

  protected async request<P extends keyof paths, M extends keyof paths[P]>(
    config: RequestConfig<P, M>
  ) {
    const { path, method, pathParams, queryParams, body } = config;
    const session = await authService.getAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const accessToken = session.tokens?.accessToken?.toString();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    headers.Authorization = `Bearer ${idToken}`;
    headers['X-Amz-Security-Token'] = accessToken || '';

    // Replace path parameters
    let url = path as string;
    if (pathParams) {
      for (const [key, value] of Object.entries(pathParams)) {
        url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
      }
    }

    // Add query parameters
    if (queryParams) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Construct fetch options
    const options: RequestInit = {
      method: (method as string).toUpperCase(),
      headers,
    };

    // Add body for POST/PUT/PATCH methods
    if (
      body &&
      ['POST', 'PUT', 'PATCH'].includes((method as string).toUpperCase())
    ) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.basePath}${url}`, options);
    let responseBody = null;
    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch (error) {
        console.warn('Failed to parse JSON response:', error);
        responseBody = null;
      }
    }

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}${
          responseBody ? `: ${JSON.stringify(responseBody)}` : ''
        }`
      );
    }

    return responseBody || null;
  }
}
