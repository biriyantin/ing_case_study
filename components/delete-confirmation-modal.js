import {LitElement, html, css} from 'lit';
import {t} from '../i18n/i18n.js';

export class DeleteConfirmationModal extends LitElement {
  static properties = {
    employeeName: {type: String},
  };

  constructor() {
    super();
    this.employeeName = '';
  }

  static styles = css`
    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: white;
      border-radius: 8px;
      width: 400px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      font-weight: bold;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 16px;
      font-size: 14px;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 12px;
      border-top: 1px solid #eee;
    }
    button {
      padding: 6px 16px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
    }
    .proceed {
      background: #ff6200;
      border: none;
      color: white;
    }
    .cancel {
      background: white;
      border: 1px solid #ccc;
    }
    .close-icon {
      background: none;
      border: none;
      font-size: 24px;
      padding: 0;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="backdrop" @click=${this._onCancel}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <div class="header">
            <span>${t('areYouSure')}</span>
            <button class="close-icon" @click=${this._onCancel}>
              <ion-icon name="close"></ion-icon>
            </button>
          </div>
          <div class="content">${this.employeeName} ${t('confirmMessage')}</div>
          <div class="actions">
            <button class="proceed" @click=${this._onProceed}>
              ${t('proceed')}
            </button>
            <button class="cancel" @click=${this._onCancel}>
              ${t('cancel')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _onProceed() {
    this.dispatchEvent(
      new CustomEvent('confirm-proceed', {bubbles: true, composed: true})
    );
  }

  _onCancel() {
    this.dispatchEvent(
      new CustomEvent('cancel-delete', {bubbles: true, composed: true})
    );
  }
}
customElements.define('delete-confirmation-modal', DeleteConfirmationModal);
