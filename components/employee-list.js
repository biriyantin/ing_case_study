import {LitElement, html, css} from 'lit';
import {store, setEmployees, setViewMode} from '../store.js';
import {navigate} from '../navigation.js';
import {mockEmployees} from '../data/employees.js';
import {t} from '../i18n/i18n.js';
import '../components/delete-confirmation-modal.js';

export class EmployeeList extends LitElement {
  static properties = {
    employees: {type: Array},
    filterText: {type: String},
    listPage: {type: Number},
    listPageSize: {type: Number},
    cardPage: {type: Number},
    cardPageSize: {type: Number},
    pendingDelete: {type: Object},
  };

  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      height: 90%;
      padding: 16px;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .toolbar h2 {
      font-size: 24px;
      color: #ff6200;
      font-weight: 500;
      padding-left: 12px;
    }
    .toolbar .controls {
      display: flex;
      gap: 8px;
      padding-right: 12px;
    }
    input[type='text'] {
      padding: 6px 10px;
      font-size: 14px;
      width: 200px;
      border: none;
      border-radius: 4px;
    }
    input:focus,
    select:focus {
      outline: #ff6200;
      border-color: #ff6200;
      box-shadow: 0 0 0 1px #ff6200;
    }
    button.view-toggle {
      padding: 6px 10px;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    .table-container {
      display: flex;
      flex-direction: column;
      height: calc(100% - 35px);
      border-radius: 12px;
    }
    .table-body {
      flex: 1;
      overflow: auto;
      scrollbar-width: none;
      background: #fff;
      border-radius: 12px;
    }
    .table-body thead {
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 1;
    }
    .table-body::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    .table-body table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      text-align: left;
      padding: 16px 8px;
      border-bottom: 1px solid #ddd;
      color: #ff6200;
      font-weight: 500;
    }
    th:first-child {
      padding-left: 16px;
    }
    th:last-child {
      min-width: 100px;
    }
    td {
      padding: 16px 8px;
    }
    td:first-child {
      padding-left: 16px;
    }
    td:last-child {
      min-width: 100px;
    }
    tr + tr td {
      border-top: 1px solid #eee;
    }
    .actions button {
      background: none;
      border: none;
      cursor: pointer;
      margin-right: 8px;
    }

    .card-container {
      display: flex;
      flex-direction: column;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      height: 100%;
      gap: 12px;
      padding-left: 48px;
      padding-right: 48px;
    }
    .card {
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, auto) 1fr;
      row-gap: 8px;
    }
    .card-field {
      display: flex;
      flex-direction: column;
    }
    .card-field .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .card-field .value {
      font-size: 14px;
      font-weight: 500;
    }
    .card-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .card-actions button {
      background: none;
      border: none;
      cursor: pointer;
    }
    .pagination {
      flex: none;
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    .pagination button {
      background: none;
      border: none;
      cursor: pointer;
    }
    ion-icon {
      font-size: 20px;
      color: #ff6200;
    }
  `;

  constructor() {
    super();
    this.employees = [];
    this.filterText = '';
    this.listPage = 1;
    this.listPageSize = 10;
    this.cardPage = 1;
    this.cardPageSize = 6;
    this.pendingDelete = null;
  }

  firstUpdated() {
    this.unsubscribe = store.subscribe(() => {
      this.requestUpdate();
    });

    if (store.getState().employees.length === 0) {
      store.dispatch(setEmployees(mockEmployees));
    }
    this.employees = store.getState().employees;

    this.addEventListener('confirm-proceed', this._confirmDelete.bind(this));
    this.addEventListener('cancel-delete', this._cancelDelete.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.removeEventListener('confirm-proceed', this._confirmDelete);
    this.removeEventListener('cancel-delete', this._cancelDelete);
  }

  get viewMode() {
    return store.getState().viewMode;
  }

  get currentPage() {
    return this.viewMode === 'list' ? this.listPage : this.cardPage;
  }

  get pageSize() {
    return this.viewMode === 'list' ? this.listPageSize : this.cardPageSize;
  }

  onFilterChange(e) {
    this.filterText = e.target.value.toLowerCase();
    if (this.viewMode === 'list') {
      this.listPage = 1;
    } else {
      this.cardPage = 1;
    }
  }

  toggleView(mode) {
    store.dispatch(setViewMode(mode));
  }

  get filteredData() {
    if (!this.filterText) return this.employees;
    return this.employees.filter((emp) =>
      `${emp.firstName} ${emp.lastName} ${emp.department}`
        .toLowerCase()
        .includes(this.filterText)
    );
  }

  formatPhone(digits) {
    let v = (digits || '').replace(/\D/g, '').slice(0, 11);
    if (v.length === 11 && v.startsWith('0')) {
      v = v.slice(1);
    } else if (v.length > 10) {
      v = v.slice(0, 10);
    }
    const p1 = v.slice(0, 3);
    const p2 = v.slice(3, 6);
    const p3 = v.slice(6, 8);
    const p4 = v.slice(8, 10);
    let result = '';
    if (p1) result += `(${p1})`;
    if (p2) result += ` ${p2}`;
    if (p3) result += ` ${p3}`;
    if (p4) result += ` ${p4}`;
    return result;
  }

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR');
  }

  get pagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get listTotalPages() {
    return Math.max(1, Math.ceil(this.filteredData.length / this.listPageSize));
  }

  get cardTotalPages() {
    return Math.max(1, Math.ceil(this.filteredData.length / this.cardPageSize));
  }

  prevPage() {
    if (this.currentPage > 1) {
      if (this.viewMode === 'list') {
        this.listPage--;
      } else {
        this.cardPage--;
      }
    }
  }

  nextPage() {
    const maxPage = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.currentPage < maxPage) {
      if (this.viewMode === 'list') {
        this.listPage++;
      } else {
        this.cardPage++;
      }
    }
  }

  goToPage(page) {
    if (this.viewMode === 'list') this.listPage = page;
    else this.cardPage = page;
  }

  _onEdit(id) {
    navigate(`#/employees/${id}/edit`);
  }

  _onDelete(id) {
    this.pendingDelete = this.employees.find((e) => e.id === id);
    this.requestUpdate();
  }

  _confirmDelete() {
    const updated = this.employees.filter(
      (emp) => emp.id !== this.pendingDelete.id
    );
    store.dispatch(setEmployees(updated));
    this.pendingDelete = null;
    this.requestUpdate();
  }

  _cancelDelete() {
    this.pendingDelete = null;
    this.requestUpdate();
  }

  render() {
    const listPages = Array.from(
      {length: this.listTotalPages},
      (_, i) => i + 1
    );
    const cardPages = Array.from(
      {length: this.cardTotalPages},
      (_, i) => i + 1
    );
    return html`
      <div class="toolbar">
        <h2>${t('employeeList')}</h2>

        <div class="controls">
          <input
            type="text"
            placeholder=${t('search')}
            @input=${this.onFilterChange}
          />
          <button
            class="view-toggle"
            @click=${() => this.toggleView('list')}
            ?disabled=${this.viewMode === 'list'}
          >
            <ion-icon name="menu"></ion-icon>
          </button>
          <button
            class="view-toggle"
            @click=${() => this.toggleView('card')}
            ?disabled=${this.viewMode === 'card'}
          >
            <ion-icon name="grid"></ion-icon>
          </button>
        </div>
      </div>
      ${this.viewMode === 'list'
        ? html`
            <div class="table-container">
              <div class="table-body">
                <table class="table-header">
                  <thead>
                    <tr>
                      <th>${t('name')}</th>
                      <th>${t('lastName')}</th>
                      <th>${t('dateofEmployment')}</th>
                      <th>${t('dateofBirth')}</th>
                      <th>${t('phoneNumber')}</th>
                      <th>${t('email')}</th>
                      <th>${t('department')}</th>
                      <th>${t('position')}</th>
                      <th>${t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.pagedData.map(
                      (emp) => html`
                        <tr>
                          <td>${emp.firstName}</td>
                          <td>${emp.lastName}</td>
                          <td>${this.formatDate(emp.dateOfEmployment)}</td>
                          <td>${this.formatDate(emp.dateOfBirth)}</td>
                          <td>${this.formatPhone(emp.phoneNumber)}</td>
                          <td>${emp.email}</td>
                          <td>${emp.department}</td>
                          <td>${emp.position}</td>
                          <td class="actions">
                            <button
                              @click=${() => this._onEdit(emp.id)}
                              title="Düzenle"
                            >
                              <ion-icon name="pencil"></ion-icon>
                            </button>
                            <button
                              @click=${() => this._onDelete(emp.id)}
                              title="Sil"
                            >
                              <ion-icon name="trash"></ion-icon>
                            </button>
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
              <div class="pagination">
                <button
                  @click=${this.prevPage}
                  ?disabled=${this.listPage === 1}
                  style="${this.listPage === 1 ? 'opacity: 0.5;' : ''}"
                >
                  <ion-icon name="chevron-back"></ion-icon>
                </button>
                ${listPages.map(
                  (page) => html`
                    <button
                      @click=${() => this.goToPage(page)}
                      style="${`width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;color:#666; border-radius: 50%; ${
                        page === this.listPage
                          ? 'background:#ff6200;color:#fff;'
                          : ''
                      }`}"
                    >
                      ${page}
                    </button>
                  `
                )}
                <button
                  @click=${this.nextPage}
                  ?disabled=${this.listPage ===
                  Math.ceil(this.filteredData.length / this.listPageSize)}
                  style="${this.listPage ===
                  Math.ceil(this.filteredData.length / this.listPageSize)
                    ? 'opacity: 0.5;'
                    : ''}"
                >
                  <ion-icon name="chevron-forward"></ion-icon>
                </button>
              </div>
            </div>
          `
        : html`
            <div class="card-container">
              <div class="card-grid">
                ${this.pagedData.map(
                  (emp) => html`
                    <div class="card">
                      <div class="card-field">
                        <span class="label">${t('name')}</span
                        ><span class="value">${emp.firstName}</span>
                      </div>
                      <div class="card-field">
                        <span class="label">${t('lastName')}</span
                        ><span class="value">${emp.lastName}</span>
                      </div>
                      <div class="card-field">
                        <span class="label">${t('dateofEmployment')}</span
                        ><span class="value"
                          >${this.formatDate(emp.dateOfEmployment)}</span
                        >
                      </div>
                      <div class="card-field">
                        <span class="label">${t('dateofBirth')}</span
                        ><span class="value"
                          >${this.formatDate(emp.dateOfBirth)}</span
                        >
                      </div>
                      <div class="card-field">
                        <span class="label">${t('phoneNumber')}</span
                        ><span class="value"
                          >${this.formatPhone(emp.phoneNumber)}
                        </span>
                      </div>
                      <div class="card-field">
                        <span class="label">${t('email')}</span
                        ><span class="value">${emp.email}</span>
                      </div>
                      <div class="card-field">
                        <span class="label">${t('department')}</span
                        ><span class="value">${emp.department}</span>
                      </div>
                      <div class="card-field">
                        <span class="label">${t('position')}</span
                        ><span class="value">${emp.position}</span>
                      </div>
                      <div class="card-actions">
                        <button @click=${() => this._onEdit(emp.id)}>
                          <ion-icon name="pencil"></ion-icon>
                        </button>
                        <button
                          @click=${() => this._onDelete(emp.id)}
                          title="Sil"
                        >
                          <ion-icon name="trash"></ion-icon>
                        </button>
                      </div>
                    </div>
                  `
                )}
              </div>
              <div class="pagination">
                <button
                  @click=${this.prevPage}
                  ?disabled=${this.cardPage === 1}
                  style="${this.cardPage === 1 ? 'opacity: 0.5;' : ''}"
                >
                  <ion-icon name="chevron-back"></ion-icon>
                </button>
                ${cardPages.map(
                  (page) => html`
                    <button
                      @click=${() => this.goToPage(page)}
                      style="${`width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;color:#666; border-radius: 50%; ${
                        page === this.cardPage
                          ? 'background:#ff6200;color:#fff;'
                          : ''
                      }`}"
                    >
                      ${page}
                    </button>
                  `
                )}
                <button
                  @click=${this.nextPage}
                  ?disabled=${this.cardPage ===
                  Math.ceil(this.filteredData.length / this.cardPageSize)}
                  style="${this.cardPage ===
                  Math.ceil(this.filteredData.length / this.cardPageSize)
                    ? 'opacity: 0.5;'
                    : ''}"
                >
                  <ion-icon name="chevron-forward"></ion-icon>
                </button>
              </div>
            </div>
          `}
      ${this.pendingDelete
        ? html`<delete-confirmation-modal
            .employeeName=${`${this.pendingDelete.firstName} ${this.pendingDelete.lastName}`}
          ></delete-confirmation-modal>`
        : ''}
    `;
  }
}

customElements.define('employee-list', EmployeeList);
