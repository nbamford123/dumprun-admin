// Example approach
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { signal } from '@preact/signals-core';

import '@/components/health-check.ts';
import { apiClientService } from '@/services/apiClientService.js';

@customElement('dashboard-view')
class DashboardView extends LitElement {
	render() {
		return html`
        <health-check-indicator name="Postgres Health" .healthCheck=${apiClientService.getPostgresHealth}></health-check-indicator>
        <health-check-indicator name="DynamoDB Health" .healthCheck=${apiClientService.getDynamoHealth}></health-check-indicator>
    `;
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'dashboard-view': DashboardView;
	}
}
