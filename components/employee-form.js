import {LitElement, html, css} from 'lit';
import {store, addEmployee, updateEmployee} from '../store.js';
import {t} from '../i18n/i18n.js';
import {navigate} from '../navigation.js';

export class EmployeeForm extends LitElement {
  static properties = {
    id: {type: Number},
    fields: {state: true},
    errors: {state: true},
    employees: {type: Array},
  };

  static styles = css`
    .toolbar {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f5f5f5;
    }
    .toolbar h2 {
      font-size: 24px;
      color: #ff6200;
      margin: 0;
    }
    .form-container {
      padding: 48px;
      background: #fff;
      border-radius: 12px;
      max-width: 800px;
      margin: 0 auto;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 48px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 14px;
    }
    input,
    select {
      padding: 8px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    input:focus,
    select:focus {
      outline: 1px solid #ff6200;
      border: none;
      box-shadow: 0 0 0 1px #ff6200;
    }
    select[name='position'] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      background: url('/assets/chevron-down.svg') no-repeat right 0.75em center;
      background-size: 1em 1em;
      padding-right: 2.5em;
    }
    .error {
      color: red;
      font-size: 12px;
      margin-top: 4px;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
    }
    button {
      padding: 8px 24px;
      font-size: 14px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
    }
    .submit {
      background: #ff6200;
      color: #fff;
    }
    .cancel {
      background: #fff;
      border: 1px solid #ccc;
    }
  `;

  constructor() {
    super();
    this.id = null;
    this.fields = {
      firstName: '',
      lastName: '',
      dateOfEmployment: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      department: '',
      position: '',
    };
    this.errors = {};
    this.employees = [];
    this.positionOptions = [
      'Stajyer',
      'Analist',
      'Uzman',
      'Yönetici',
      'Koordinatör',
      'Müdür',
      'Asistan',
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe(() => {
      this.employees = store.getState().employees;
      this.requestUpdate();
    });
    this.employees = store.getState().employees;
    if (this.id) {
      const emp = this.employees.find((e) => e.id == this.id);
      if (emp) this.fields = {...emp};
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  formatPhone(digits) {
    const v = (digits || '').replace(/\D/g, '').slice(0, 10);
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

  onInput(e) {
    const {name, value} = e.target;
    this.fields = {...this.fields, [name]: value};
    this.errors = {...this.errors, [name]: ''};
  }

  onPhoneInput(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    this.fields = {...this.fields, phoneNumber: raw};
    this.errors = {...this.errors, phoneNumber: ''};
  }

  validate() {
    const errs = {};
    const f = this.fields;
    [
      'firstName',
      'lastName',
      'dateOfEmployment',
      'dateOfBirth',
      'phoneNumber',
      'email',
      'department',
      'position',
    ].forEach((key) => {
      if (!f[key]?.trim()) errs[key] = t('validationRequired');
    });
    // Email pattern
    if (f.email && !/.+@.+\..+/.test(f.email))
      errs.email = t('validationEmail');
    // Phone numeric
    if (f.phoneNumber && !/^\d{10}$/.test(f.phoneNumber))
      errs.phoneNumber = t('validationPhone');
    // Duplicate check (excluding current id)
    const dup = this.employees.find(
      (e) =>
        e.id !== this.id &&
        ((e.firstName === f.firstName && e.lastName === f.lastName) ||
          e.phoneNumber === f.phoneNumber ||
          e.email === f.email)
    );

    if (dup) errs.duplicate = t('validationDuplicate');

    this.errors = errs;
    return Object.keys(errs).length === 0;
  }

  onSubmit(e) {
    e.preventDefault();
    if (!this.validate()) return;
    const payload = {...this.fields};
    if (this.id) {
      payload.id = this.id;
      store.dispatch(updateEmployee(payload));
    } else {
      payload.id = Date.now().toString();
      store.dispatch(addEmployee(payload));
    }
    this.onCancel();
  }

  onCancel() {
    navigate('#/employees');
  }

  render() {
    const f = this.fields;
    const e = this.errors;
    const isEdit = Boolean(this.id);
    return html`
      <div class="toolbar">
        <h2>${isEdit ? t('editTitle') : t('addTitle')}</h2>
      </div>
      <div class="form-container">
        ${e.duplicate ? html`<div class="error">${e.duplicate}</div>` : ''}
        <form @submit=${this.onSubmit} novalidate>
          <div class="fields-grid">
            <label>
              ${t('name')}
              <input
                name="firstName"
                .value=${f.firstName}
                @input=${this.onInput}
              />
              ${e.firstName
                ? html`<div class="error">${e.firstName}</div>`
                : ''}
            </label>
            <label>
              ${t('lastName')}
              <input
                name="lastName"
                .value=${f.lastName}
                @input=${this.onInput}
              />
              ${e.lastName ? html`<div class="error">${e.lastName}</div>` : ''}
            </label>
            <label>
              ${t('dateofEmployment')}
              <input
                type="date"
                name="dateOfEmployment"
                .value=${f.dateOfEmployment}
                @input=${this.onInput}
              />
              ${e.dateOfEmployment
                ? html`<div class="error">${e.dateOfEmployment}</div>`
                : ''}
            </label>
            <label>
              ${t('dateofBirth')}
              <input
                type="date"
                name="dateOfBirth"
                .value=${f.dateOfBirth}
                @input=${this.onInput}
              />
              ${e.dateOfBirth
                ? html`<div class="error">${e.dateOfBirth}</div>`
                : ''}
            </label>
            <label>
              ${t('phoneNumber')}
              <input
                type="text"
                name="phoneNumber"
                .value=${this.formatPhone(f.phoneNumber)}
                @input=${this.onPhoneInput}
                maxlength="15"
              />
              ${e.phoneNumber
                ? html`<div class="error">${e.phoneNumber}</div>`
                : ''}
            </label>
            <label>
              ${t('email')}
              <input
                type="email"
                name="email"
                .value=${f.email}
                @input=${this.onInput}
              />
              ${e.email ? html`<div class="error">${e.email}</div>` : ''}
            </label>
            <label>
              ${t('department')}
              <input
                name="department"
                .value=${f.department}
                @input=${this.onInput}
              />
              ${e.department
                ? html`<div class="error">${e.department}</div>`
                : ''}
            </label>
            <label>
              ${t('position')}
              <select
                name="position"
                .value=${f.position}
                @change=${this.onInput}
              >
                <option value="" disabled hidden>${t('selectPosition')}</option>
                ${this.positionOptions.map(
                  (pos) =>
                    html`<option value="${pos}" ?selected=${f.position === pos}>
                      ${pos}
                    </option>`
                )}
              </select>
              ${e.position ? html`<div class="error">${e.position}</div>` : ''}
            </label>
          </div>
          <div class="buttons">
            <button type="button" class="cancel" @click=${this.onCancel}>
              ${t('cancel')}
            </button>
            <button type="submit" class="submit">${t('save')}</button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define('employee-form', EmployeeForm);
