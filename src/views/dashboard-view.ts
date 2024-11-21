// Example approach
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { signal } from '@preact/signals-core';

import '@/components/health-check.ts';
import { api } from '@/services/apiClientService.js';

@customElement('dashboard-view')
class DashboardView extends LitElement {
	render() {
		return html`
      <app-header></app-header>
      <main>
        <health-check-indicator name="Postgres Health" .healthCheck=${api.checkPostgresHealth}></health-check-indicator>
        <health-check-indicator name="DynamoDB Health" .healthCheck=${api.checkDynamoDbHealth}></health-check-indicator>
      </main>
    `;
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'dashboard-view': DashboardView;
	}
}
