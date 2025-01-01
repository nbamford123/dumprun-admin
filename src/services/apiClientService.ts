import { APIClient } from './apiClient';
import type { components, operations } from '@/types/apiSchema';

// TODO: export these and use them in the views
type UpdateUser = components['schemas']['UpdateUser'];
type NewUser = components['schemas']['NewUser'];
type User = components['schemas']['User'];
type UpdateDriver = components['schemas']['UpdateDriver'];
type NewDriver = components['schemas']['NewDriver'];
type Driver = components['schemas']['Driver'];
type UpdatePickup = components['schemas']['UpdatePickup'];
type NewPickup = components['schemas']['NewPickup'];
type Pickup = components['schemas']['Pickup'];

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

  getDrivers = async (params?: { limit?: number; offset?: number }) => {
    return this.request({
      path: '/drivers',
      method: 'get',
      queryParams: params,
    });
  };
  getDriver = async (driverId: string): Promise<Driver> => {
    return this.request({
      path: '/drivers/{driverId}',
      method: 'get',
      pathParams: {
        driverId,
      },
    });
  };
  updateDriver = async (driverId: string, driver: UpdateDriver) => {
    return this.request({
      path: '/drivers/{driverId}',
      method: 'put',
      pathParams: {
        driverId,
      },
      body: driver,
    });
  };
  createDriver = async (driver: NewDriver) => {
    return this.request({
      path: '/drivers',
      method: 'post',
      body: driver,
    });
  };
  deleteDriver = async (driverId: string) => {
    return this.request({
      path: '/drivers/{driverId}',
      method: 'delete',
      pathParams: {
        driverId,
      },
    });
  };

  getUsers = async (params?: { limit?: number; offset?: number }) => {
    return this.request({
      path: '/users',
      method: 'get',
      queryParams: params,
    });
  };
  getUser = async (userId: string): Promise<User> => {
    return this.request({
      path: '/users/{userId}',
      method: 'get',
      pathParams: {
        userId,
      },
    });
  };
  updateUser = async (userId: string, user: UpdateUser) => {
    return this.request({
      path: '/users/{userId}',
      method: 'put',
      pathParams: {
        userId,
      },
      body: user,
    });
  };
  createUser = async (user: NewUser) => {
    return this.request({
      path: '/users',
      method: 'post',
      body: user,
    });
  };
  deleteUser = async (userId: string) => {
    return this.request({
      path: '/users/{userId}',
      method: 'delete',
      pathParams: {
        userId,
      },
    });
  };

  getPickups = async (params?: {
    status: operations['listPickups']['parameters']['query']['status'];
    limit?: number;
    cursor?: string;
    startRequestedTime?: string;
    endRequestedTime?: string;
  }) => {
    return this.request({
      path: '/pickups',
      method: 'get',
      queryParams: params,
    });
  };
  getPickup = async (pickupId: string): Promise<Pickup> => {
    return this.request({
      path: '/pickups/{pickupId}',
      method: 'get',
      pathParams: {
        pickupId,
      },
    });
  };
  updatePickup = async (pickupId: string, pickup: UpdatePickup) => {
    return this.request({
      path: '/pickups/{pickupId}',
      method: 'put',
      pathParams: {
        pickupId,
      },
      body: pickup,
    });
  };
  createPickup = async (pickup: NewPickup) => {
    return this.request({
      path: '/pickups',
      method: 'post',
      body: pickup,
    });
  };
  deletePickup = async (pickupId: string) => {
    return this.request({
      path: '/pickups/{pickupId}',
      method: 'delete',
      pathParams: {
        pickupId,
      },
    });
  };
}

export const apiClientService = APIClientService.getInstance();
