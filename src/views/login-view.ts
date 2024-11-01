// src/views/login-view.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { router } from '@/router.js';
import { authService } from '@/services/authService.js';

@customElement('login-view')
export class LoginView extends LitElement {
	@state() private username = '';
	@state() private password = '';
	@state() private error = '';
	@state() private loading = false;

	static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .login-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin: 0 0 1.5rem;
      text-align: center;
    }

    .error { 
      color: red;
      margin: 10px 0;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    input {
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 1rem;
    }

    button {
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }

    button:disabled {
      background: #ccc;
    }
  `;

	async handleSubmit(e: Event) {
		e.preventDefault();
		this.error = '';
		this.loading = true;

		try {
			await authService.signIn(this.username, this.password);
			// Check if there was an intended route before redirect
			const intendedRoute = sessionStorage.getItem('intendedRoute') || '/';
			sessionStorage.removeItem('intendedRoute'); // Clean up
			await router.render(intendedRoute);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			this.loading = false;
		}
	}

	render() {
		return html`
      <div class="login-container">
        <h1>Admin Login</h1>
        <form @submit=${this.handleSubmit}>
          ${this.error ? html`<div class="error">${this.error}</div>` : ''}
          <input
            type="text"
            placeholder="Username"
            .value=${this.username}
            @input=${(e: InputEvent) => (this.username = (e.target as HTMLInputElement).value)}
            ?disabled=${this.loading}
          />
          <input
            type="password"
            placeholder="Password"
            .value=${this.password}
            @input=${(e: InputEvent) => (this.password = (e.target as HTMLInputElement).value)}
            ?disabled=${this.loading}
          />
          <button type="submit" ?disabled=${this.loading}>
            ${this.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    `;
	}
}
