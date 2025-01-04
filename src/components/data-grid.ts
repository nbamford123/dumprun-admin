import { LitElement, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type {
  // createGrid,
  GridApi,
  GridOptions,
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

import { notify } from '@/services/toastService.js';
import { toTitleCase } from '@/utils/titleCase';

export type DataFetcher<T> = () => Promise<T[]>;
export type DeleteHandler = (id: string) => Promise<void>;

declare global {
  interface Window {
    agGrid: {
      createGrid: (element: HTMLElement, options: GridOptions) => GridApi;
    };
  }
}

export class DataGrid<T extends { id: string }> extends LitElement {
  @property({ type: Array })
  data: T[] = [];

  @property({ type: String })
  dataType = '';

  @property({ type: Function })
  fetchData!: DataFetcher<T>;

  @property({ type: Function })
  handleDelete!: DeleteHandler;

  @state()
  private dataToDelete: T | null = null;

  // Define the delete column for all grids
  protected columnDefs: ColDef[] = [
    {
      field: 'delete',
      headerName: '',
      width: 20,
      cellRenderer: this.deleteButtonRenderer.bind(this),
      cellStyle: { padding: '0' }, // Add some padding for the button
    },
  ];
  protected grid?: GridApi<T>;
  // Track theme initialization
  private static themeInitialized = false;
  @query('sl-dialog')
  private dialog!: HTMLElementTagNameMap['sl-dialog'];

  static styles = css`
    :host {
      display: block;
    }

    .grid-container {
      height: 500px;
      width: 100%;
    }

    .grid-wrapper {
      height: 100%;
      width: 100%;
      --ag-theme-name: 'quartz';
    }

    h2 {
      margin-bottom: 1rem;
    }
  `;

  private deleteButtonRenderer(params: ICellRendererParams) {
    const button = document.createElement('sl-button');
    button.name = 'trash';
    button.variant = 'text';
    button.addEventListener('click', () =>
      this.showDeleteConfirmation(params.node.data)
    );
    const icon = document.createElement('sl-icon');
    icon.name = 'trash';
    button.appendChild(icon);
    return button;
  }

  showDeleteConfirmation = (data: T) => {
    this.dataToDelete = data;
    // Show the confirmation dialog
    this.dialog.show();
  };

  private async handleDeleteData() {
    // Close the dialog
    this.dialog.hide();
    if (!this.dataToDelete) return;

    try {
      await this.handleDelete(this.dataToDelete.id);
      notify(`${toTitleCase(this.dataType)} deleted`, 'success');
      // Refresh the grid data
      const data = await this.fetchData();
      this.grid?.updateGridOptions({ rowData: data });
      // Clear data to delete
      this.dataToDelete = null;
    } catch (error) {
      console.error('Failed to delete data:', error);
      notify(
        `Failed to delete ${this.dataType}: ${
          (error as { message: string }).message
        }`,
        'danger'
      );
    }
  }

  // Consider adding a way to refresh the grid on reconnect
  connectedCallback() {
    super.connectedCallback();
    // If grid was previously initialized and destroyed, reinitialize it
    if (!this.grid && this.isConnected) {
      this.requestUpdate();
    }
  }

  // Clean up the grid when the component is removed
  disconnectedCallback() {
    if (this.grid) {
      this.grid.destroy();
      this.grid = undefined;
    }
    super.disconnectedCallback();
  }

  async firstUpdated() {
    // Initialize theme only once
    if (!DataGrid.themeInitialized) {
      // You might need to import the actual registration function from ag-grid
      // This is just an example of the concept
      DataGrid.themeInitialized = true;
    }
    const gridOptions: GridOptions = {
      columnDefs: this.columnDefs,
      pagination: true,
      paginationPageSize: 20,
      rowSelection: 'single',
      onGridReady: this.onGridReady.bind(this),
      loadThemeGoogleFonts: true,
      // theme: themeQuartz,
    };
    const gridWrapper =
      this.renderRoot.querySelector<HTMLElement>('.grid-wrapper');
    if (gridWrapper) {
      this.grid = window.agGrid.createGrid(gridWrapper, gridOptions);
    }
  }

  async onGridReady(params: GridReadyEvent) {
    try {
      const data = await this.fetchData();
      params.api.updateGridOptions({ rowData: data });
    } catch (error) {
      console.error(`Failed to load ${this.dataType} data:`, error);
      notify(`Failed to delete ${this.dataType} data`, 'danger');
    }
  }

  render() {
    return html`
      <div class="grid-container">
        <div class="grid-wrapper ag-theme-quartz"></div>
      </div>
      <sl-dialog label="Confirm Delete">
        Are you sure you want to delete ${this.dataType}
        ${this.dataToDelete?.id}? This action cannot be undone.
        <div slot="footer" class="dialog-buttons">
          <sl-button variant="neutral" @click=${() => this.dialog.hide()}>
            Cancel
          </sl-button>
          <sl-button variant="danger" @click=${this.handleDeleteData}>
            Delete ${toTitleCase(this.dataType)}
          </sl-button>
        </div>
      </sl-dialog>
    `;
  }
}
