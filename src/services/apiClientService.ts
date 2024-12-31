import { APIClient } from './apiClient';
import type { components } from '@/types/apiSchema';

type UpdateUser = components['schemas']['UpdateUser'];
type NewUser = components['schemas']['NewUser'];
type User = components['schemas']['User'];

export class APIClientService extends APIClient {
  private static instance: APIClientService;

  static getInstance(): APIClientService {
    if (!APIClientService.instance) {
      APIClientService.instance = new APIClientService(
        import.meta.env.VITE_AWS_GATEWAY_API_BASE_PATH
      );
    }
    return APIClientService.instance;
  }

  getPostgresHealth = async () => {
    return this.request({
      path: '/health/postgres',
      method: 'get',
    });
  };

  getDynamoHealth = async () => {
    return this.request({
      path: '/health/dynamodb',
      method: 'get',
    });
  };

  async getDriver(driverId: string) {
    return this.request({
      path: '/drivers/{driverId}',
      method: 'get',
      pathParams: {
        driverId,
      },
    });
  }

  async getUsers(params?: { limit?: number; offset?: number }) {
    return this.request({
      path: '/users',
      method: 'get',
      queryParams: params,
    });
  }

  async getUser(userId: string): Promise<User> {
    return this.request({
      path: '/users/{userId}',
      method: 'get',
      pathParams: {
        userId,
      },
    });
  }

  async updateUser(userId: string, user: UpdateUser) {
    return this.request({
      path: '/users/{userId}',
      method: 'put',
      pathParams: {
        userId,
      },
      body: user,
    });
  }

  async createUser(user: NewUser) {
    return this.request({
      path: '/users',
      method: 'post',
      body: user,
    });
  }
}

export const apiClientService = APIClientService.getInstance();
