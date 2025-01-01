import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import { Router, type RouterLocation } from '@vaadin/router';

import { apiClientService } from '@/services/apiClientService.js';
import { notify } from '@/services/toastService.js';

import type { components } from '@/types/apiSchema.js';

type Driver = components['schemas']['Driver'];
type NewDriver = components['schemas']['NewDriver'];
type UpdateDriver = components['schemas']['UpdateDriver'];

@customElement('driver-view')
export class DriverView extends LitElement {
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
    .name-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .address-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
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
    sl-radio-group::part(base) {
      display: flex;
      gap: 2rem;
    }
    .vehicle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
    h3 {
      margin: 1rem 0 0.5rem;
      color: var(--sl-color-neutral-700);
      font-size: var(--sl-font-size-medium);
      font-weight: var(--sl-font-weight-semibold);
    }
  `;

  @state() private formData: NewDriver | UpdateDriver = {
    firstName: 'Test',
    lastName: 'Driver',
    email: 'none@none.com',
    address: {
      street: '123 Main',
      city: 'Detroit',
      state: 'MI',
      zipCode: '22212',
    },
    phoneNumber: '720-525-1212',
    preferredContact: 'TEXT',
    vehicleMake: 'Ford',
    vehicleModel: 'F150',
    vehicleYear: 1996,
  };
  @state() private errors: Record<string, string> = {};
  @state() private loading = false;
  @state() private loadError = '';

  // Editing if driver id is specified
  private get isEditing() {
    return !!this.location?.params?.id && this.location?.params?.id !== 'new';
  }

  // Vaadin Router adds this automatically
  private location?: RouterLocation;

  // Called by Vaadin Router when the component is navigated to
  async onBeforeEnter(location: RouterLocation) {
    console.log('id', this.location?.params?.id);
    this.location = location;
    if (this.isEditing) {
      const id = this.location?.params?.id;
      await this.loadContactData((id as string) ?? '');
    }
  }

  private async loadContactData(id: string) {
    try {
      this.loading = true;
      this.loadError = '';

      const driver = await apiClientService.getDriver(id);
      this.formData = {
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        address: { ...driver.address },
        phoneNumber: driver.phoneNumber,
        preferredContact: driver.preferredContact || 'TEXT',
        vehicleMake: driver.vehicleMake,
        vehicleModel: driver.vehicleModel,
        vehicleYear: driver.vehicleYear,
      };
    } catch (error) {
      console.error('Error loading driver:', error);
      this.loadError = 'Failed to load driver. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      let response: Response;
      if (this.isEditing) {
        const { phoneNumber: _, ...updateDriver } = this.formData as NewDriver;
        response = await apiClientService.updateDriver(
          this.location?.params?.id as string,
          updateDriver
        );
      } else {
        response = await apiClientService.createDriver(
          this.formData as NewDriver
        );
      }
      notify('Driver created', 'success');
      // Navigate back to list view or wherever appropriate
      Router.go('/drivers');
    } catch (error) {
      notify(`Error creating driver ${(error as Error).message}`, 'danger');
      console.error('Error saving:', error);
    }
  }

  validateField(name: string, value: string) {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ''
          : 'Invalid email address';
      case 'phoneNumber':
        return /^\d{10}$/.test(value.replace(/\D/g, ''))
          ? ''
          : 'Phone number must be 10 digits';
      case 'zip':
        return /^\d{5}(-\d{4})?$/.test(value) ? '' : 'Invalid ZIP code';
      case 'firstName':
      case 'lastName':
        return value.trim()
          ? ''
          : `${name === 'firstName' ? 'First' : 'Last'} name is required`;
      default:
        return '';
    }
  }

  handleInput(e: Event) {
    const field = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;

    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      this.formData = {
        ...this.formData,
        address: {
          ...this.formData.address,
          [addressField]: value,
        },
      } as Driver;
    }
    // Convert number fields to actual numbers before setting in formData
    else if (field === 'vehicleYear') {
      this.formData = {
        ...this.formData,
        [field]: value ? Number.parseInt(value) : undefined,
      };
    } else {
      this.formData = {
        ...this.formData,
        [field]: value,
      };
    }

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
          <h2>${this.isEditing ? 'Edit Driver' : 'New Driver'}</h2>
        </sl-header>

        <form @submit=${this.handleSubmit} class="form-grid">
          <div class="name-grid">
            <div class="form-field">
              <sl-input
                id="firstName"
                label="First Name"
                name="firstName"
                value=${this.formData.firstName}
                @sl-input=${this.handleInput}
                ?invalid=${this.errors.firstName}
              ></sl-input>
              ${this.errors.firstName
                ? html`<div class="error-text">${this.errors.firstName}</div>`
                : ''}
            </div>

            <div class="form-field">
              <sl-input
                id="lastName"
                label="Last Name"
                name="lastName"
                value=${this.formData.lastName}
                @sl-input=${this.handleInput}
                ?invalid=${this.errors.lastName}
              ></sl-input>
              ${this.errors.lastName
                ? html`<div class="error-text">${this.errors.lastName}</div>`
                : ''}
            </div>
          </div>

          <div class="form-field">
            <sl-input
              id="street"
              label="Street"
              name="address.street"
              value=${this.formData.address?.street}
              @sl-input=${this.handleInput}
            ></sl-input>
          </div>

          <div class="address-grid">
            <div class="form-field">
              <sl-input
                id="city"
                label="City"
                name="address.city"
                value=${this.formData.address?.city}
                @sl-input=${this.handleInput}
              ></sl-input>
            </div>

            <div class="form-field">
              <sl-input
                id="state"
                label="State"
                name="address.state"
                value=${this.formData.address?.state}
                @sl-input=${this.handleInput}
                maxlength="2"
              ></sl-input>
            </div>

            <div class="form-field">
              <sl-input
                id="zip"
                label="Zip Code"
                name="address.zipCode"
                value=${this.formData.address?.zipCode}
                @sl-input=${this.handleInput}
                ?invalid=${this.errors.zip}
              ></sl-input>
              ${this.errors.zip
                ? html`<div class="error-text">${this.errors.zip}</div>`
                : ''}
            </div>
          </div>

          <div class="form-field">
            <sl-input
              id="email"
              label="Email"
              name="email"
              type="email"
              value=${this.formData.email}
              @sl-input=${this.handleInput}
              ?invalid=${this.errors.email}
            ></sl-input>
            ${this.errors.email
              ? html`<div class="error-text">${this.errors.email}</div>`
              : ''}
          </div>

          <div class="form-field">
            <sl-input
              id="phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              value=${(this.formData as Driver).phoneNumber}
              @sl-input=${this.handleInput}
              ?readOnly=${this.isEditing}
              ?invalid=${this.errors.phoneNumber}
            ></sl-input>
            ${this.errors.phoneNumber
              ? html`<div class="error-text">${this.errors.phoneNumber}</div>`
              : ''}
          </div>

          <div class="form-field">
            <sl-radio-group
              label="Preferred Contact Method"
              name="preferredContact"
              value=${this.formData.preferredContact}
              @sl-change=${this.handleInput}
            >
              <sl-radio-button value="TEXT">Text</sl-radio-button>
              <sl-radio-button value="CALL">Call</sl-radio-button>
            </sl-radio-group>
          </div>
          <h3>Vehicle Information</h3>
          <div class="vehicle-grid">
            <div class="form-field">
              <sl-input
                id="vehicleMake"
                label="Vehicle Make"
                name="vehicleMake"
                value=${this.formData.vehicleMake}
                @sl-input=${this.handleInput}
              ></sl-input>
            </div>

            <div class="form-field">
              <sl-input
                id="vehicleModel"
                label="Vehicle Model"
                name="vehicleModel"
                value=${this.formData.vehicleModel}
                @sl-input=${this.handleInput}
              ></sl-input>
            </div>

            <div class="form-field">
              <sl-input
                id="vehicleYear"
                label="Vehicle Year"
                name="vehicleYear"
                type="number"
                min="1900"
                max=${new Date().getFullYear() + 1}
                value=${this.formData.vehicleYear}
                @sl-input=${this.handleInput}
                ?invalid=${this.errors.vehicleYear}
              ></sl-input>
              ${this.errors.vehicleYear
                ? html`<div class="error-text">${this.errors.vehicleYear}</div>`
                : ''}
            </div>
          </div>
          <div class="button-group">
            <sl-button @click=${() => Router.go('/drivers')} variant="neutral">
              Cancel
            </sl-button>
            <sl-button type="submit" variant="primary">
              ${this.isEditing ? 'Update Driver' : 'Create Driver'}
            </sl-button>
          </div>
        </form>
      </sl-card>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'driver-view': DriverView;
  }
}
