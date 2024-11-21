import { get, type ApiError } from '@aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

import type { HealthCheckResponse } from '@/types/apiTypes.js';
import { authService } from './authService.js';

// Define a helper type for Amplify's response structure
type AmplifyResponse<T> = Promise<{
	body: T;
	response: Response;
	headers: Record<string, string>;
}>;

class ApiClient {
	private static instance: ApiClient;
	private apiName: string;
  private cachedHeaders: Record<string, string> | null = null;
	private headersFetchPromise: Promise<Record<string, string>> | null = null;

	private constructor(apiName: string) {
		this.apiName = apiName;
	}

	public static getInstance(): ApiClient {
		if (!ApiClient.instance) {
			ApiClient.instance = new ApiClient('DumpRunApi'); // Your configured API name
		}
		return ApiClient.instance;
	}

	// Helper method to get authorization headers
	private async getAuthHeaders(): Promise<Record<string, string>> {
    // If we have cached headers, use them
    if (this.cachedHeaders) {
      return this.cachedHeaders;
    }

    // If we're already fetching headers, return that promise
    if (this.headersFetchPromise) {
      return this.headersFetchPromise;
    }

    // Create a new promise for fetching headers
    this.headersFetchPromise = (async () => {
      try {
        const session = await fetchAuthSession();
        this.cachedHeaders = {
          Authorization: `Bearer ${session.tokens?.idToken?.toString()}`,
          'X-Amz-Security-Token': session.tokens?.accessToken?.toString() || '',
        };
        return this.cachedHeaders;
      } finally {
        // Clear the promise but keep the cached headers
        this.headersFetchPromise = null;
      }
    })();

    return this.headersFetchPromise;
  }

  public clearAuthHeaders(): void {
    this.cachedHeaders = null;
    this.headersFetchPromise = null;
  }

	// Generic request handler
	private async makeRequest<T>(path: string): Promise<T | undefined> {
		const headers = await this.getAuthHeaders();
		console.log(`Making request to ${path}`);

		try {
			const result = await get({
				apiName: this.apiName,
				path,
				options: {
					headers,
					withCredentials: true,
				},
			});

			const apiResponse = await result.response;
			return (await apiResponse.body.json()) as T;
		} catch (err) {
			console.error(`Error making request to ${path}:`, err);
			if (err instanceof Error && 'response' in err) {
				console.log(await (err as ApiError).response);
			}
			throw err;
		}
	}

	// Health checks
	checkPostgresHealth = () => {
		console.log('Checking postgres health');
		return this.makeRequest<HealthCheckResponse>('v1/health/postgres');
	};

	checkDynamoDbHealth = () => {
		console.log('Checking dynamodb health');
		return this.makeRequest<HealthCheckResponse>('v1/health/dynamodb');
	};
	// Users
	// async listUsers(params?: { limit?: number; offset?: number }) {
	// 	type ResponseType =
	// 		paths['/v1/users']['get']['responses'][200]['content']['application/json'];
	// 	const result = (await get({
	// 		apiName: this.apiName,
	// 		path: '/v1/users',
	// 		options: {
	// 			queryParams: params,
	// 		},
	// 	})) as AmplifyResponse<ResponseType>;

	// 	return (await result.response).body as ResponseType;
	// }

	// async createUser(newUser: components['schemas']['NewUser']) {
	// 	type ResponseType =
	// 		paths['/v1/users']['post']['responses'][201]['content']['application/json'];
	// 	const result = (await post({
	// 		apiName: this.apiName,
	// 		path: '/v1/users',
	// 		options: {
	// 			body: newUser,
	// 		},
	// 	})) as AmplifyResponse<ResponseType>;

	// 	return (await result.response).body as ResponseType;
	// }
}

// Export a single instance
export const api = ApiClient.getInstance();
