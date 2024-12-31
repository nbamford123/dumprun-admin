import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { components } from '@/types/apiSchema.js';

@customElement('health-check-indicator')
export class HealthCheckIndicator extends LitElement {
  // Public properties
  @property({ type: Function })
  healthCheck?: () => Promise<components['schemas']['HealthCheck']>;

  @property({ type: String })
  name = 'Service';

  // Internal state
  @state()
  private status: 'checking' | 'healthy' | 'unhealthy' = 'checking';

  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--sl-font-sans);
    }

    .container {
      border: var(--sl-panel-border-width) solid var(--sl-panel-border-color);
      border-radius: var(--sl-border-radius-medium);
      padding: var(--sl-spacing-medium);
      width: 200px;
      background: var(--sl-color-neutral-0);
      box-shadow: var(--sl-shadow-x-small);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sl-spacing-small);
    }

    .title {
      font-size: var(--sl-font-size-small);
      font-weight: var(--sl-font-weight-semibold);
      color: var(--sl-color-neutral-700);
      margin: 0;
    }

    .status {
      display: flex;
      gap: var(--sl-spacing-x-small);
    }
  `;

  protected firstUpdated() {
    console.log('first updated');
    this.checkHealth();
  }

  private async checkHealth() {
    if (!this.healthCheck) {
      console.warn('No health check callback provided');
      return;
    }
    this.status = 'checking';

    try {
      const health = await this.healthCheck();
      console.log('health', health);
      this.status = health.status || 'unhealthy';
    } catch (error) {
      console.error(error);
      this.status = 'unhealthy';
    }
  }

  private getStatusDetails() {
    switch (this.status) {
      case 'healthy':
        return {
          icon: 'check-circle',
          variant: 'success',
          text: 'Healthy',
        };
      case 'unhealthy':
        return {
          icon: 'exclamation-circle',
          variant: 'danger',
          text: 'Unhealthy',
        };
      default:
        return {
          icon: 'question-circle',
          variant: 'neutral',
          text: 'Checking...',
        };
    }
  }

  render() {
    const statusDetails = this.getStatusDetails();

    return html`
      <div class="container">
        <div class="header">
          <h3 class="title">${this.name}</h3>
          <sl-button size="small" variant="text" @click=${this.checkHealth}>
            <sl-icon name="arrow-clockwise"></sl-icon>
          </sl-button>
        </div>
        <div class="status">
          <sl-icon name=${statusDetails.icon}></sl-icon>
          <sl-badge variant=${statusDetails.variant}
            >${statusDetails.text}</sl-badge
          >
        </div>
      </div>
    `;
  }
}

// Add type declarations for the custom element
declare global {
  interface HTMLElementTagNameMap {
    'health-check-indicator': HealthCheckIndicator;
  }
}
