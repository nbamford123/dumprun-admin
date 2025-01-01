// src/views/login-view.ts
import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { customElement, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

import { authService } from '@/services/authService.js';
import { notify } from '@/services/toastService.js';

@customElement('login-view')
export class LoginView extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--sl-color-neutral-50);
      padding: 1rem;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: inherit;
    }

    sl-card {
      max-width: 400px;
      width: 100%;
    }

    .title {
      margin: 0 0 var(--sl-spacing-large);
      text-align: center;
      font-size: var(--sl-font-size-large);
      font-weight: var(--sl-font-weight-semibold);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--sl-spacing-medium);
    }

    .error {
      margin-bottom: var(--sl-spacing-medium);
    }

    sl-button::part(base) {
      width: 100%;
    }

    sl-button::part(label) {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sl-spacing-small);
    }
  `;

  @state() private username = '';
  @state() private password = '';
  @state() private error = '';
  @state() private loading = false;

  async handleSubmit(e: Event) {
    e.preventDefault();
    this.error = '';
    this.loading = true;

    try {
      await authService.signIn(this.username, this.password);
      // Check if there was an intended route before redirect
      const intendedRoute = sessionStorage.getItem('intendedRoute') || '/';
      sessionStorage.removeItem('intendedRoute'); // Clean up
      await Router.go(intendedRoute);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'An error occurred';
      notify(this.error, 'danger', 'exclamation-octagon');
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="container">
        <sl-card>
          <h1 class="title">DumpRun Admin Login</h1>

          <form @submit=${this.handleSubmit}>
            <sl-input
              label="Username"
              type="text"
              required
              .value=${this.username}
              ?disabled=${this.loading}
              @sl-input=${(e: InputEvent) => {
                this.username = (e.target as HTMLInputElement).value;
              }}
              autocomplete="username"
            ></sl-input>

            <sl-input
              label="Password"
              type="password"
              required
              .value=${this.password}
              ?disabled=${this.loading}
              @sl-input=${(e: InputEvent) => {
                this.password = (e.target as HTMLInputElement).value;
              }}
              password-toggle
              autocomplete="current-password"
            ></sl-input>

            <sl-button
              type="submit"
              variant="primary"
              ?disabled=${this.loading}
            >
              ${this.loading
                ? html` <sl-spinner></sl-spinner> Signing in... `
                : 'Sign In'}
            </sl-button>
          </form>
        </sl-card>
      </div>
    `;
  }
}
