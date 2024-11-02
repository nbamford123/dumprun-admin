// src/components/app-layout.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/avatar/avatar.js';

import { router } from '@/router.js';
import { authService } from '@/services/authService.js';
import { notify } from '@/services/toastService.js';

@customElement('app-layout')
export class AppLayout extends LitElement {
	@state()
	private drawerOpen = false;

	static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .layout {
      display: grid;
      grid-template-rows: auto 1fr;
      min-height: 100vh;
    }

    header {
      display: flex;
      align-items: center;
      gap: var(--sl-spacing-medium);
      padding: var(--sl-spacing-small) var(--sl-spacing-large);
      background: var(--sl-color-neutral-0);
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }

    .header-start {
      display: flex;
      align-items: center;
      gap: var(--sl-spacing-medium);
    }

    .header-end {
      display: flex;
      align-items: center;
      gap: var(--sl-spacing-medium);
      margin-left: auto;
    }

    .logo {
      font-size: var(--sl-font-size-large);
      font-weight: var(--sl-font-weight-semibold);
      color: var(--sl-color-primary-600);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: var(--sl-spacing-x-small);
    }

    .content {
      display: grid;
      grid-template-columns: auto 1fr;
      min-height: 100%;
    }

    nav {
      background: var(--sl-color-neutral-50);
      padding: var(--sl-spacing-medium);
      border-right: 1px solid var(--sl-color-neutral-200);
      width: 250px;
    }

    .nav-content {
      display: flex;
      flex-direction: column;
      gap: var(--sl-spacing-small);
    }

    main {
      padding: var(--sl-spacing-large);
      background: var(--sl-color-neutral-0);
    }

    .mobile-menu {
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-menu {
        display: block;
      }

      .content {
        grid-template-columns: 1fr;
      }

      nav {
        display: none;
      }
    }

    /* Style Shoelace components */
    sl-dropdown::part(panel) {
      z-index: 100;
    }

    sl-avatar::part(base) {
      cursor: pointer;
    }

    .user-menu::part(base) {
      width: 200px;
    }
  `;

	private async handleLogout() {
		try {
			await authService.signOut();
      router.render('/');
			notify('Logged out successfully', 'success');
		} catch (error) {
			notify('Failed to log out', 'danger');
		}
	}

	render() {
		return html`
      <div class="layout">
        <!-- Header -->
        <header>
          <div class="header-start">
            <!-- Mobile Menu Toggle -->
            <sl-icon-button
              class="mobile-menu"
              name="list"
              label="Menu"
              @click=${() => {
								this.drawerOpen = true;
							}}
            ></sl-icon-button>

            <!-- Logo -->
            <a href="/" class="logo" @click=${(e: Event) => {
							e.preventDefault();
							router.render('/');
						}}>
              <sl-icon name="lightning-charge-fill"></sl-icon>
              Your App
            </a>
          </div>

          <div class="header-end">
            <!-- User Menu -->
            <sl-dropdown>
              <sl-avatar
                slot="trigger"
                label="User menu"
                image="https://via.placeholder.com/40"
              ></sl-avatar>

              <sl-menu class="user-menu">
                <sl-menu-item @click=${() => router.render('/profile')}>
                  <sl-icon slot="prefix" name="person"></sl-icon>
                  Profile
                </sl-menu-item>
                
                <sl-menu-item @click=${() => router.render('/settings')}>
                  <sl-icon slot="prefix" name="gear"></sl-icon>
                  Settings
                </sl-menu-item>
                
                <sl-divider></sl-divider>
                
                <sl-menu-item @click=${this.handleLogout}>
                  <sl-icon slot="prefix" name="box-arrow-right"></sl-icon>
                  Logout
                </sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        </header>

        <div class="content">
          <!-- Mobile Navigation Drawer -->
          <sl-drawer
            label="Navigation"
            .open=${this.drawerOpen}
            @sl-hide=${() => {
							this.drawerOpen = false;
						}}
            placement="start"
          >
            <nav class="nav-content">
              <sl-button href="/dashboard" variant="text">
                <sl-icon slot="prefix" name="speedometer"></sl-icon>
                Dashboard
              </sl-button>
              
              <sl-button href="/users" variant="text">
                <sl-icon slot="prefix" name="people"></sl-icon>
                Users
              </sl-button>
              
              <sl-button href="/settings" variant="text">
                <sl-icon slot="prefix" name="gear"></sl-icon>
                Settings
              </sl-button>
            </nav>
          </sl-drawer>

          <!-- Desktop Navigation -->
          <nav class="nav-content">
            <sl-button href="/dashboard" variant="text">
              <sl-icon slot="prefix" name="speedometer"></sl-icon>
              Dashboard
            </sl-button>
            
            <sl-button href="/users" variant="text">
              <sl-icon slot="prefix" name="people"></sl-icon>
              Users
            </sl-button>
            
            <sl-button href="/settings" variant="text">
              <sl-icon slot="prefix" name="gear"></sl-icon>
              Settings
            </sl-button>
          </nav>

          <!-- Main Content -->
          <main>
            <slot></slot>
          </main>
        </div>
      </div>
    `;
	}
}
