// src/main.ts
import { authService } from '@/services/authService.js';
import '@/components/admin-app';
import '@/views/login-view';
import '@/views/dashboard-view';
// import './views/users-view';
// import './views/not-found-view';
import '@/components/app-layout';

// Configure auth
authService.configure({
	region: import.meta.env.VITE_AWS_REGION || '',
	userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
	userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
});
