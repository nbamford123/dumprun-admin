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

  // @state() private formData: NewDriver | UpdateDriver = {
  //   firstName: 'Test',
  //   lastName: 'Driver',
  //   email: 'none@none.com',
  //   address: {
  //     street: '123 Main',
  //     city: 'Detroit',
  //     state: 'MI',
  //     zipCode: '22212',
  //   },
  //   phoneNumber: '720-525-1212',
  //   preferredContact: 'TEXT',
  //   vehicleMake: 'Ford',
  //   vehicleModel: 'F150',
  //   vehicleYear: 1996,
  // };
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
      // await this.loadContactData((id as string) ?? '');
      console.log("editing")
    }
  }

  // private async loadContactData(id: string) {
  //   try {
  //     this.loading = true;
  //     this.loadError = '';

  //     const driver = await apiClientService.getDriver(id);
  //     this.formData = {
  //       firstName: driver.firstName,
  //       lastName: driver.lastName,
  //       email: driver.email,
  //       address: { ...driver.address },
  //       phoneNumber: driver.phoneNumber,
  //       preferredContact: driver.preferredContact || 'TEXT',
  //       vehicleMake: driver.vehicleMake,
  //       vehicleModel: driver.vehicleModel,
  //       vehicleYear: driver.vehicleYear,
  //     };
  //   } catch (error) {
  //     console.error('Error loading driver:', error);
  //     this.loadError = 'Failed to load driver. Please try again.';
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  // async handleSubmit(e: Event) {
  //   e.preventDefault();
  //   try {
  //     let response: Response;
  //     if (this.isEditing) {
  //       const { phoneNumber: _, ...updateDriver } = this.formData as NewDriver;
  //       response = await apiClientService.updateDriver(
  //         this.location?.params?.id as string,
  //         updateDriver
  //       );
  //     } else {
  //       response = await apiClientService.createDriver(
  //         this.formData as NewDriver
  //       );
  //     }
  //     notify('Driver created', 'success');
  //     // Navigate back to list view or wherever appropriate
  //     Router.go('/drivers');
  //   } catch (error) {
  //     notify(`Error creating driver ${(error as Error).message}`, 'danger');
  //     console.error('Error saving:', error);
  //   }
  // }

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

  // handleInput(e: Event) {
  //   const field = (e.target as HTMLInputElement).name;
  //   const value = (e.target as HTMLInputElement).value;

  //   if (field.startsWith('address.')) {
  //     const addressField = field.split('.')[1];
  //     this.formData = {
  //       ...this.formData,
  //       address: {
  //         ...this.formData.address,
  //         [addressField]: value,
  //       },
  //     } as Driver;
  //   }
  //   // Convert number fields to actual numbers before setting in formData
  //   else if (field === 'vehicleYear') {
  //     this.formData = {
  //       ...this.formData,
  //       [field]: value ? Number.parseInt(value) : undefined,
  //     };
  //   } else {
  //     this.formData = {
  //       ...this.formData,
  //       [field]: value,
  //     };
  //   }

  //   const error = this.validateField(field, value);
  //   if (error) {
  //     this.errors = { ...this.errors, [field]: error };
  //   } else {
  //     const { [field]: removed, ...rest } = this.errors;
  //     this.errors = rest;
  //   }

  //   this.requestUpdate();
  // }

  render() {
    return html`
      <sl-card>
        <sl-header slot="header">
          <h2>${this.isEditing ? 'Edit Pickup' : 'New Pickup'}</h2>
        </sl-header>
      </sl-card>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'pickup-view': PickupView;
  }
}
