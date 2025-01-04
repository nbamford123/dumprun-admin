import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import { Router, type RouterLocation } from '@vaadin/router';

import {
  apiClientService,
  type Pickup,
  type NewPickup,
  type UpdatePickup,
} from '@/services/apiClientService.js';
import { notify } from '@/services/toastService.js';

@customElement('pickup-view')
export class PickupView extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .form-grid {
      display: grid;
      gap: 1rem;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .error-text {
      color: var(--sl-color-danger-600);
      font-size: var(--sl-font-size-small);
      margin-top: -0.5rem;
    }
    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }
    sl-select::part(form-control) {
      display: grid;
    }
    .readonly-field {
      color: var(--sl-color-neutral-700);
      background-color: var(--sl-color-neutral-50);
      padding: 0.5rem;
      border-radius: var(--sl-border-radius-medium);
      font-family: var(--sl-font-sans);
    }
    .readonly-label {
      color: var(--sl-color-neutral-600);
      font-size: var(--sl-font-size-small);
      margin-bottom: 0.25rem;
    }
  `;

  @state() private formData: Omit<Pickup, 'id'> & NewPickup = {
    location: '',
    estimatedWeight: 0,
    wasteType: 'household',
    requestedTime: new Date().toISOString(), // Default to now, formatted for datetime-local
    status: 'pending',
  };
  @state() private errors: Record<string, string> = {};
  @state() private loading = false;
  @state() private loadError = '';

  // Editing if pickup id is specified
  private get isEditing() {
    return !!this.location?.params?.id && this.location?.params?.id !== 'new';
  }

  // Vaadin Router adds this automatically
  private location?: RouterLocation;

  async onBeforeEnter(location: RouterLocation) {
    this.location = location;
    if (this.isEditing) {
      await this.loadPickupData(this.location?.params?.id as string);
    }
  }

  private async loadPickupData(id: string) {
    try {
      this.loading = true;
      this.loadError = '';

      const pickup = await apiClientService.getPickup(id);
      this.formData = {
        location: pickup.location || '',
        estimatedWeight: pickup.estimatedWeight || 0,
        wasteType: pickup.wasteType || 'household',
        requestedTime: pickup.requestedTime || new Date().toISOString(),
        status: pickup.status,
        userId: pickup.userId,
        driverId: pickup.driverId,
      };
    } catch (error) {
      console.error('Error loading pickup:', error);
      this.loadError = 'Failed to load pickup request. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      let response: Response;
      // extract fields that are never submitted
      const { userId, driverId, status, ...data } = this.formData;
      if (this.isEditing) {
        response = await apiClientService.updatePickup(
          this.location?.params?.id as string,
          data
        );
        console.log(response);
      } else {
        response = await apiClientService.createPickup(data);
      }
      notify('Pickup request saved', 'success');
      Router.go('/pickups');
    } catch (error) {
      notify(
        `Error saving pickup request: ${(error as Error).message}`,
        'danger'
      );
      console.error('Error saving:', error);
    }
  }

  validateField(name: string, value: string | number) {
    switch (name) {
      case 'location':
        return value.toString().trim() ? '' : 'Location is required';
      case 'estimatedWeight':
        return typeof value === 'number' && value > 0
          ? ''
          : 'Weight must be a positive number';
      case 'requestedTime':
        return value ? '' : 'Requested time is required';
      default:
        return '';
    }
  }

  handleInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const field = target.name;
    let value: string | number = target.value;

    // Convert number fields
    if (field === 'estimatedWeight') {
      value = value ? Number.parseFloat(value) : 0;
    }

    this.formData = {
      ...this.formData,
      [field]: value,
    };

    const error = this.validateField(field, value);
    if (error) {
      this.errors = { ...this.errors, [field]: error };
    } else {
      const { [field]: removed, ...rest } = this.errors;
      this.errors = rest;
    }

    this.requestUpdate();
  }

  render() {
    return html`
      <sl-card>
        <sl-header slot="header">
          <h2>
            ${this.isEditing ? 'Edit Pickup Request' : 'New Pickup Request'}
          </h2>
        </sl-header>

        <form @submit=${this.handleSubmit} class="form-grid">
          <div class="form-field">
            <sl-input
              id="location"
              label="Pickup Location"
              name="location"
              value=${this.formData.location}
              @sl-input=${this.handleInput}
              ?invalid=${this.errors.location}
              required
            ></sl-input>
            ${this.errors.location
              ? html`<div class="error-text">${this.errors.location}</div>`
              : ''}
          </div>

          <div class="form-field">
            <sl-input
              id="estimatedWeight"
              label="Estimated Weight (lbs)"
              name="estimatedWeight"
              type="number"
              min="0"
              step="0.1"
              value=${this.formData.estimatedWeight}
              @sl-input=${this.handleInput}
              ?invalid=${this.errors.estimatedWeight}
            ></sl-input>
            ${this.errors.estimatedWeight
              ? html`<div class="error-text">
                  ${this.errors.estimatedWeight}
                </div>`
              : ''}
          </div>

          <div class="form-field">
            <sl-select
              label="Waste Type"
              name="wasteType"
              value=${this.formData.wasteType}
              @sl-change=${this.handleInput}
              required
            >
              <sl-option value="household">Household</sl-option>
              <sl-option value="construction">Construction</sl-option>
              <sl-option value="green">Green/Yard Waste</sl-option>
              <sl-option value="electronic">Electronic</sl-option>
            </sl-select>
          </div>

          ${this.isEditing
            ? html`
                <div class="form-field">
                  <div class="readonly-label">User ID</div>
                  <div class="readonly-field">
                    ${this.formData.userId || 'Not assigned'}
                  </div>
                </div>

                <div class="form-field">
                  <div class="readonly-label">Driver ID</div>
                  <div class="readonly-field">
                    ${this.formData.driverId || 'Not assigned'}
                  </div>
                </div>
              `
            : ''}

          <div class="form-field">
            <sl-input
              id="requestedTime"
              label="Requested Pickup Time"
              name="requestedTime"
              type="datetime-local"
              value=${this.formData.requestedTime.slice(0, 16)}
              @sl-input=${this.handleInput}
              ?invalid=${this.errors.requestedTime}
              required
            ></sl-input>
            ${this.errors.requestedTime
              ? html`<div class="error-text">${this.errors.requestedTime}</div>`
              : ''}
          </div>

          ${this.isEditing
            ? html`
                <div class="form-field">
                  <sl-select
                    label="Status"
                    name="status"
                    value=${(this.formData as Pickup).status}
                    @sl-change=${this.handleInput}
                  >
                    <sl-option value="pending">Pending</sl-option>
                    <sl-option value="available">Available</sl-option>
                    <sl-option value="accepted">Accepted</sl-option>
                    <sl-option value="in_progress">In Progress</sl-option>
                    <sl-option value="completed">Completed</sl-option>
                    <sl-option value="cancelled">Cancelled</sl-option>
                  </sl-select>
                </div>
              `
            : ''}

          <div class="button-group">
            <sl-button @click=${() => Router.go('/pickups')} variant="neutral">
              Cancel
            </sl-button>
            <sl-button type="submit" variant="primary">
              ${this.isEditing
                ? 'Update Pickup Request'
                : 'Create Pickup Request'}
            </sl-button>
          </div>
        </form>
      </sl-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pickup-view': PickupView;
  }
}
