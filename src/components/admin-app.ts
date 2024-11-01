// src/components/admin-app.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { initRouter } from '@/router.js';
import { authService } from '@/services/authService.js';

@customElement('admin-app')
export class AdminApp extends LitElement {
	@state() private initializing = true;

	static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    #outlet {
      height: 100%;
    }

    .init-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .init-loader .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
		} finally {
			this.initializing = false;
		}
	}

	render() {
		return html`
      ${
				this.initializing
					? html`
        <div class="init-loader">
          <div class="spinner"></div>
        </div>
      `
					: ''
			}
      <div id="outlet"></div>
    `;
	}
}
