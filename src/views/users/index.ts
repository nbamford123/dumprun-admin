import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import {
  createGrid,
  type GridOptions,
  type ColDef,
  type GridReadyEvent,
  themeQuartz,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { router } from '@/router';

import { apiClientService } from '@/services/apiClientService.js';

@customElement('users-view')
class UsersView extends LitElement {
  private gridOptions: GridOptions;
  private columnDefs: ColDef[];

  constructor() {
    super();
    // Define the columns
    this.columnDefs = [
      {
        field: 'id',
        sort: 'desc',
        cellRenderer: (id: { value: string }) =>
          `<a href="/users/${id.value}">${id.value}</a>`,
      },
      { field: 'name' },
      { field: 'email' },
      { field: 'phoneNumber' },
      { field: 'address' },
      { field: 'createdAt' },
      { field: 'updatedAt' },
    ];

    // Grid options
    this.gridOptions = {
      columnDefs: this.columnDefs,
      pagination: true,
      paginationPageSize: 10,
      rowSelection: 'single',
      onGridReady: this.onGridReady.bind(this),
      theme: themeQuartz,
    };
  }

  firstUpdated() {
    const gridElement = this.renderRoot.querySelector<HTMLElement>(
      'ag-grid-webcomponent'
    );
    if (gridElement) createGrid(gridElement, this.gridOptions);
  }

  async onGridReady(params: GridReadyEvent) {
    try {
      const users = await apiClientService.getUsers();
      params.api.updateGridOptions({ rowData: users.users });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  render() {
    return html`
      <h2>Users</h2>
      <div style="height: 500px;" class="ag-theme-alpine">
        <ag-grid-webcomponent
          id="myGrid"
          style="height: 100%; width: 100%;"
        ></ag-grid-webcomponent>
      </div>
      <sl-button @click=${() => router.render('/users/new')} variant="primary">
        Create User
      </sl-button>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'users-view': UsersView;
  }
}
