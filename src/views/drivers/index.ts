import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { DataGrid } from '@/components/data-grid';
import { apiClientService } from '@/services/apiClientService.js';
import type { components } from '@/types/apiSchema.js';

type Driver = components['schemas']['Driver'];

@customElement('drivers-grid')
class DriversGrid extends DataGrid<Driver> {
  constructor() {
    super();
    this.columnDefs = [
      {
        field: 'id',
        sort: 'desc',
        cellRenderer: (id: { value: string }) =>
          `<a href="/drivers/${id.value}">${id.value}</a>`,
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
      { field: 'vehicleMake' },
      { field: 'vehicleModel' },
      { field: 'vehicleYear' },
      { field: 'createdAt' },
      { field: 'updatedAt' },
      ...this.columnDefs,
    ];
    this.dataType = 'driver';
    this.fetchData = async () => {
      const data = await apiClientService.getDrivers();
      return data.drivers;
    };
    this.handleDelete = apiClientService.deleteDriver;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'drivers-grid': DriversGrid;
  }
}

@customElement('drivers-view')
class DriversView extends LitElement {
  render() {
    return html`
      <h2>Drivers</h2>
      <drivers-grid></drivers-grid>
      <sl-button href="/drivers/new" variant="primary">
        Create Driver</sl-button
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'drivers-view': DriversView;
  }
}
