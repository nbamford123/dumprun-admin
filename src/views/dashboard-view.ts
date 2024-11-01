// Example approach
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { signal } from '@preact/signals-core';


@customElement('dashboard-view')
class DashboardView extends LitElement {

  render() {
    return html`
      <app-header></app-header>
      <main>
        <h1>hi, there</h1>
      </main>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'dashboard-view': DashboardView;
  }
}

