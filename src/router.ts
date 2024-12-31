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
  command: Commands
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
  // Start loading
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
  try {
    // Wait for auth guard
    const result = await authGuard(context, command);
    if (result) {
      return result;
    }
  } finally {
    // Stop loading after a small delay to prevent flash
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
      }
    }, 100);
  }
};

export function initRouter(outlet: HTMLElement) {
  router.setOutlet(outlet);

  router.setRoutes([
    {
      path: '/login',
      component: 'login-view',
      action: async () => {
        await import('@/views/login-view');
        return beforeRoute;
      },
    },
    {
      path: '',
      component: 'app-layout',
      action: beforeRoute,
      children: [
        {
          path: '/',
          component: 'dashboard-view',
          action: async () => {
            await import('@/views/dashboard-view');
          },
        },
        {
          path: '/users',
          component: 'users-view',
          action: async () => {
            await import('@/views/users');
          },
        },
        {
          path: '/users/:id',
          component: 'user-view',
          action: async () => {
            await import('@/views/users/[id]');
          },
        },
        {
          path: '/users/new',
          component: 'user-view',
          action: async () => {
            await import('@/views/users/[id]');
          },
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
