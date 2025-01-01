import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { DataGrid } from '@/components/data-grid';
import { apiClientService } from '@/services/apiClientService.js';
import type { components } from '@/types/apiSchema.js';

type Pickup = components['schemas']['Pickup'];

@customElement('pickups-grid')
class PickupsGrid extends DataGrid<Pickup> {
  constructor() {
    super();
    this.columnDefs = [
      {
        field: 'id',
        sort: 'desc',
        cellRenderer: (id: { value: string }) =>
          `<a href="/pickups/${id.value}">${id.value}</a>`,
      },
      { field: 'userId' },
      { field: 'driverId' },
      { field: 'status' },
      { field: 'location' },
      { field: 'estimatedWeight' },
      { field: 'wasteType' },
      { field: 'requestedTime' },
      { field: 'vehicleYear' },
      { field: 'assignedTime' },
      { field: 'completedTime' },
      { field: 'deletedAt' },
      ...this.columnDefs,
    ];
    this.dataType = 'pickup';
    this.fetchData = async () => {
      const data = await apiClientService.getPickups({
        status: 'pending',
      });
      return data.pickups;
    };
    this.handleDelete = apiClientService.deletePickup;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'pickups-grid': PickupsGrid;
  }
}

@customElement('pickups-view')
class PickupsView extends LitElement {
  render() {
    return html`
      <h2>Pickups</h2>
      <pickups-grid></pickups-grid>
      <sl-button href="/pickups/new" variant="primary">
        Create Pickup</sl-button
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pickups-view': PickupsView;
  }
}
