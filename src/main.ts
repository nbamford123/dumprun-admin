import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

import { authService } from '@/services/authService.js';
import '@/components/admin-app.js';
import '@/components/app-layout.js';
import '@/views/login-view.js';

// shoelace assets base path
if (import.meta.env.DEV) 
  setBasePath('node_modules/@shoelace-style/shoelace/dist');
else 
  setBasePath('assets/shoelace');

// Configure auth
authService.configure({
	region: import.meta.env.VITE_AWS_REGION || '',
	userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
	userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
});
