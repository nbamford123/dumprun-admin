// src/router/index.ts
import {
	Router,
	type RouteContext,
	type Commands,
	type RedirectResult,
} from '@vaadin/router';

import { authService } from '@/services/authService.js';

export const router = new Router();

// Auth guard for protected routes
const authGuard = async (
	context: RouteContext,
	command: Commands,
): Promise<RedirectResult | undefined> => {
	try {
		// Skip auth check for login page
		if (context.pathname === '/login') {
			const isAuthenticated = await authService.isAuthenticated();
			if (isAuthenticated) {
				return command.redirect('/');
			}
			return undefined;
		}

		// Check authentication for all other routes
		const isAuthenticated = await authService.isAuthenticated();
		if (!isAuthenticated) {
			sessionStorage.setItem('intendedRoute', context.pathname);
			return command.redirect('/login');
		}

		return undefined;
	} catch (error) {
		console.error('Auth check failed:', error);
		return command.redirect('/login');
	}
};

// Route loading handler
const beforeRoute = async (context: RouteContext, command: Commands) => {
	// // Start loading
	// router.setLoading(true);
	// try {
	// 	// Wait for auth guard
	// 	const result = await authGuard(context, command);
	// 	if (result) {
	// 		return result;
	// 	}
	// } finally {
	// 	// Stop loading after a small delay to prevent flash
	// 	setTimeout(() => {
	// 		Router.setLoading(false);
	// 	}, 100);
	// }
};

export function initRouter(outlet: HTMLElement) {
	router.setOutlet(outlet);

	router.setRoutes([
		{
			path: '/login',
			component: 'login-view',
			action: beforeRoute,
		},
		{
			path: '',
			component: 'app-layout',
			action: beforeRoute,
			children: [
				{
					path: '/',
					component: 'dashboard-view',
				},
				{
					path: '/users',
					component: 'users-view',
				},
				{
					path: '(.*)',
					component: 'not-found-view',
				},
			],
		},
	]);

	return router;
}
