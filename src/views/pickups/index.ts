import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';

import { DataGrid } from '@/components/data-grid';
import { apiClientService, type Pickup } from '@/services/apiClientService.js';
import { notify } from '@/services/toastService.js';

// Custom Cell Renderer Component
// TODO: extract this into a custom component piece for data-grid
type MenuParams = {
  data: Pickup;
  onAccept: (id: string) => void;
  onCancel: (id: string) => void;
};
class MenuCellRenderer {
  private eGui: HTMLDivElement | null = null;
  private params?: MenuParams;

  init(params: MenuParams) {
    // Create the main container
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = `
      <sl-dropdown hoist>
        <sl-button slot="trigger" size="small" variant="text">
          <sl-icon name="three-dots-vertical"></sl-icon>
        </sl-button>
        <sl-menu>
          <sl-menu-item value="accept">
            <sl-icon slot="prefix" name="pencil"></sl-icon>
            Accept Pickup
          </sl-menu-item>
          <sl-menu-item value="cancel">
            <sl-icon slot="prefix" name="trash"></sl-icon>
            Cancel Accepted Pickup
          </sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;

    // Add event listener for menu selection
    const menu = this.eGui.querySelector('sl-menu');
    menu?.addEventListener('sl-select', (event) => {
      const selectedValue = event.detail.item.value;

      switch (selectedValue) {
        case 'accept':
          this.onAccept();
          break;
        case 'cancel':
          this.onCancelAccepted();
          break;
      }
    });
  }

  getGui() {
    return this.eGui;
  }

  onAccept() {
    if (this.params?.onAccept) this.params.onAccept(this.params?.data.id);
  }

  onCancelAccepted() {
    if (this.params?.onCancel) this.params.onCancel(this.params?.data.id);
  }

  destroy() {
    // Cleanup if necessary
  }
}

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
      { field: 'assignedTime' },
      { field: 'completedTime' },
      { field: 'deletedAt' },
      {
        headerName: '',
        field: 'actions',
        width: 20,
        sortable: false,
        filter: false,
        cellRenderer: MenuCellRenderer,
        cellRendererParams: {
          onAccept: this.handleAcceptPickup,
          onCancel: this.handleCancelAcceptedPickup,
        },
      },
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
  private async handleAcceptPickup(id: string) {
    try {
      await apiClientService.acceptPickup(id);
      // Refresh the grid data
      const data = await this.fetchData();
      this.grid?.updateGridOptions({ rowData: data });
    } catch (error) {
      console.error('Failed to accept pickup:', error);
      notify(
        `Failed to accept pickup ${id}: ${
          (error as { message: string }).message
        }`,
        'danger'
      );
    }
  }

  private async handleCancelAcceptedPickup(id: string) {
    try {
      await apiClientService.cancelAcceptedPickup(id);
      // Refresh the grid data
      const data = await this.fetchData();
      this.grid?.updateGridOptions({ rowData: data });
    } catch (error) {
      console.error('Failed to cancel accepted pickup:', error);
      notify(
        `Failed to cancel accepted pickup ${id}: ${
          (error as { message: string }).message
        }`,
        'danger'
      );
    }
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
