// src/components/app-layout.ts
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import { authService } from '@/services/authService.js';
import { router } from '@/router.js';

@customElement('app-layout')
export class AppLayout extends LitElement {
	static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }
    
    header {
      background: #f8f9fa;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dee2e6;
    }

    nav {
      padding: 1rem;
    }

    nav a {
      margin-right: 1rem;
      color: #007bff;
      text-decoration: none;
    }

    .content {
      padding: 20px;
    }
  `;

	async handleSignOut() {
		try {
			await authService.signOut();
			await router.render('/login');
		} catch (error) {
			console.error('Sign out error:', error);
		}
	}

	render() {
		return html`
      <header>
        <div>
          <h1>Admin Dashboard</h1>
          <nav>
            <a href="/" @click=${(e: Event) => {
							e.preventDefault();
							router.render('/');
						}}>Dashboard</a>
            <a href="/users" @click=${(e: Event) => {
							e.preventDefault();
							router.render('/users');
						}}>Users</a>
          </nav>
        </div>
        <button @click=${this.handleSignOut}>Sign Out</button>
      </header>
      <div class="content">
        <slot></slot>
      </div>
    `;
	}
}
