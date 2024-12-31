import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import type { RouterLocation } from '@vaadin/router';

import { apiClientService } from '@/services/apiClientService.js';
import { notify } from '@/services/toastService.js';
import { router } from '@/router.js';

import type { components } from '@/types/apiSchema.js';

type User = components['schemas']['User'];
type NewUser = components['schemas']['NewUser'];
type UpdateUser = components['schemas']['UpdateUser'];

@customElement('user-view')
export class UserView extends LitElement {
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
  `;

  @state() private formData: NewUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'none@none.com',
    address: {
      street: '123 Main',
      city: 'Sandusky',
      state: 'OH',
      zipCode: '22212',
    },
    phoneNumber: '720-288-0102',
    preferredContact: 'TEXT',
  };
  @state() private errors: Record<string, string> = {};
  @state() private loading = false;
  @state() private loadError = '';

  // Editing if user id is specified
  private get isEditing() {
    return !!this.location?.params?.id && this.location?.params?.id !== 'new';
  }

  // Vaadin Router adds this automatically
  private location?: RouterLocation;

  // Called by Vaadin Router when the component is navigated to
  async onBeforeEnter(location: RouterLocation) {
    this.location = location;
    if (this.isEditing) {
      const id = this.location?.params?.id;
      console.log('id', id);
      await this.loadContactData((id as string) ?? '');
    }
  }

  private async loadContactData(id: string) {
    try {
      this.loading = true;
      this.loadError = '';

      const user = await apiClientService.getUser(id);
      console.log('retrieved user ', user);
      this.formData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: { ...user.address },
        phoneNumber: user.phoneNumber,
        preferredContact: user.preferredContact || 'TEXT',
      };
    } catch (error) {
      console.error('Error loading user:', error);
      this.loadError = 'Failed to load user. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      let response: Response;
      if (this.isEditing) {
        const { phoneNumber: _, ...updateUser } = this.formData;
        response = await apiClientService.updateUser(
          this.location?.params?.id as string,
          updateUser
        );
      } else {
        response = await apiClientService.createUser(this.formData as NewUser);
      }
      notify('User created', 'success');
      // Navigate back to list view or wherever appropriate
      router.render('/users');
    } catch (error) {
      notify('Error creating user', 'danger');
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
          <h2>${this.isEditing ? 'Edit User' : 'New User'}</h2>
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
              value=${this.formData.phoneNumber}
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
          <div class="button-group">
            <sl-button
              @click=${() => router.render('/users')}
              variant="neutral"
            >
              Cancel
            </sl-button>
            <sl-button type="submit" variant="primary">
              ${this.isEditing ? 'Update User' : 'Create User'}
            </sl-button>
          </div>
        </form>
      </sl-card>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'user-view': UserView;
  }
}
