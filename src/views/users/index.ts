import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { DataGrid } from '@/components/data-grid';
import { apiClientService } from '@/services/apiClientService.js';
import type { components } from '@/types/apiSchema.js';

type User = components['schemas']['User'];

@customElement('users-grid')
class UsersGrid extends DataGrid<User> {
  constructor() {
    super();
    this.columnDefs = [
      {
        field: 'id',
        sort: 'desc',
        cellRenderer: (id: { value: string }) =>
          `<a href="/users/${id.value}">${id.value}</a>`,
      },
      { field: 'firstName' },
      { field: 'lastName' },
      { field: 'email' },
      { field: 'phoneNumber' },
      {
        field: 'address',
        valueGetter: (params) => {
          const addr = params.data.address;
          return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
        },
      },
      { field: 'createdAt' },
      { field: 'updatedAt' },
      ...this.columnDefs,
    ];
    this.dataType = 'user';
    this.fetchData = async () => {
      const data = await apiClientService.getUsers();
      return data.users;
    };
    this.handleDelete = apiClientService.deleteUser;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'users-grid': UsersGrid;
  }
}

@customElement('users-view')
class UsersView extends LitElement {
  render() {
    return html`
      <h2>Users</h2>
      <users-grid></users-grid>
      <sl-button href="/users/new" variant="primary"> Create User </sl-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'users-view': UsersView;
  }
}
