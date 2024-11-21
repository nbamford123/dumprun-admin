import type { paths, components } from '@/types/apiSchema';

export type HealthCheckResponse =
	| paths['/v1/health/postgres']['get']['responses'][200]['content']['application/json']
	| paths['/v1/health/postgres']['get']['responses'][500]['content']['application/json'];

// | paths['/v1/health/dynamodb']['get']['responses'][200]['content']['application/json']
// | paths['/v1/health/dynamodb']['get']['responses'][500]['content']['application/json'];
