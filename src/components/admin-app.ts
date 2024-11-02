// src/components/admin-app.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { initRouter } from '@/router.js';
import { authService } from '@/services/authService.js';

@customElement('admin-app')
export class AdminApp extends LitElement {
	static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    #outlet {
      height: 100%;
    }
  `;

	async firstUpdated() {
		try {
			// Initialize router with the outlet
			const outlet = this.renderRoot.querySelector('#outlet') as HTMLElement;
			if (!outlet) throw new Error('Router outlet not found');

			const router = initRouter(outlet);
			// Check initial auth state and navigate accordingly
			const isAuthenticated = await authService.isAuthenticated();
			const currentPath = window.location.pathname;

			// Handle initial navigation based on auth state
			if (!isAuthenticated && currentPath !== '/login') {
				sessionStorage.setItem('intendedRoute', currentPath);
				await router.render('/login');
			} else if (isAuthenticated && currentPath === '/login') {
				await router.render('/');
			}
		} catch (error) {
			console.error('Failed to initialize application:', error);
			// You might want to add error handling UI here
		}
	}

	render() {
		return html`<div id="outlet"></div>`;
	}
}
