import {LitElement, html, css} from 'lit';
import {navigate} from '../navigation.js';
import {store, changeLocale} from '../store.js';
import {t} from '../i18n/i18n.js';

export class MainPage extends LitElement {
  static properties = {
    locale: {type: String},
    dropdownOpen: {type: Boolean},
  };

  constructor() {
    super();
    this.locale = store.getState().locale;
    this.dropdownOpen = false;
  }

  firstUpdated() {
    this.unsubscribe = store.subscribe(() => {
      const newLocale = store.getState().locale;
      if (newLocale !== this.locale) {
        this.locale = newLocale;
        this.requestUpdate();
      }
    });
    this._outsideClickHandler = (e) => {
      const selector = this.renderRoot.querySelector('.lang-selector');
      if (
        this.dropdownOpen &&
        selector &&
        !selector.contains(e.composedPath()[0])
      ) {
        this.dropdownOpen = false;
        this.requestUpdate();
      }
    };
    document.addEventListener('click', this._outsideClickHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    document.removeEventListener('click', this._outsideClickHandler);
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: var(--font-family-base);
      overflow: hidden;
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: var(--spacing-md) var(--spacing-lg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      flex: none;
    }
    .nav-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav-left .nav-icon {
      width: 32px;
      height: 32px;
      background: url('../assets/ing.svg') no-repeat center/contain;
    }
    .nav-left .nav-title {
      font-size: 20px;
      font-weight: 500;
      color: #000066;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .nav-right button {
      margin: 0;
      padding: var(--spacing-sm) var(--spacing-md);
      border: none;
      background: none;
      color: #ff6200;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }
    #page-container {
      background: #f5f5f5;
      padding: 0 48px 16px 48px;
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .lang-selector {
      position: relative;
    }
    .lang-button {
      margin: 0;
      border: none;
      background: none;
      cursor: pointer;
      color: orange;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }
    .lang-button img {
      width: 20px;
      height: 20px;
    }
    .lang-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      z-index: 10;
    }
    .lang-dropdown button {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 12px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
    }
    .lang-dropdown button:hover {
      background: #f0f0f0;
    }
  `;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectLocale(loc) {
    store.dispatch(changeLocale(loc));
    this.dropdownOpen = false;
  }

  render() {
    return html`
      <nav>
        <div class="nav-left">
          <div class="nav-icon"></div>
          <span class="nav-title">ING</span>
        </div>
        <div class="nav-right">
          <button @click=${() => navigate('#/employees')}>
            <ion-icon name="people"></ion-icon>
            ${t('employees')}
          </button>
          <button @click=${() => navigate('#/employees/new')}>
            <ion-icon name="add-circle"></ion-icon>
            ${t('addNew')}
          </button>
          <div class="lang-selector">
            <button class="lang-button" @click=${this.toggleDropdown}>
              <img
                src="assets/flags/${this.locale}.svg"
                alt="${this.locale}"
                width="24"
                height="24"
              />
            </button>
            ${this.dropdownOpen
              ? html`
                  <div class="lang-dropdown">
                    <button @click=${() => this.selectLocale('en')}>
                      <img
                        src="assets/flags/en.svg"
                        alt="en"
                        width="24"
                        height="24"
                      />
                      English
                    </button>
                    <button @click=${() => this.selectLocale('tr')}>
                      <img
                        src="assets/flags/tr.svg"
                        alt="tr"
                        width="24"
                        height="24"
                      />
                      Türkçe
                    </button>
                  </div>
                `
              : ''}
          </div>
        </div>
      </nav>
      <div id="page-container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('main-page', MainPage);
