import './polyfill.js';
import {fixture, assert, html} from '@open-wc/testing';
import '../components/employee-form.js';
import {store, addEmployee, updateEmployee} from '../store.js';

suite('employee-form', () => {
  let el;
  let originalDispatch;
  let dispatchedActions = [];

  setup(async () => {
    originalDispatch = store.dispatch;
    dispatchedActions = [];
    Object.defineProperty(store, 'dispatch', {
      value: (action) => dispatchedActions.push(action),
      configurable: true,
    });

    el = await fixture(html`<employee-form></employee-form>`);
    await el.updateComplete;
  });

  teardown(() => {
    Object.defineProperty(store, 'dispatch', {
      value: originalDispatch,
      configurable: true,
    });
  });

  test('is defined and renders form fields', () => {
    assert.instanceOf(el, customElements.get('employee-form'));
    const names = [
      'firstName',
      'lastName',
      'dateOfEmployment',
      'dateOfBirth',
      'phoneNumber',
      'email',
      'department',
      'position',
    ];
    names.forEach((name) => {
      const field = el.shadowRoot.querySelector(`[name="${name}"]`);
      assert.ok(field, `field "${name}" should be rendered`);
    });
  });

  test('onInput updates fields state and clears error', async () => {
    const input = el.shadowRoot.querySelector('input[name="firstName"]');
    el.errors = {firstName: 'required'};
    await el.updateComplete;
    input.value = 'Alice';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    assert.equal(
      el.fields.firstName,
      'Alice',
      'fields.firstName should update'
    );
    assert.equal(el.errors.firstName, '', 'errors.firstName should be cleared');
  });

  test('validate() blocks submission on empty required fields', () => {
    const valid = el.validate();
    assert.isFalse(
      valid,
      'validate should return false if required fields are empty'
    );
    const keys = Object.keys(el.errors);
    assert.isAtLeast(
      keys.length,
      1,
      'errors object should have at least one property'
    );
  });

  test('validate() catches invalid email and phone', () => {
    el.fields.email = 'not-an-email';
    el.fields.phoneNumber = '123';
    el.fields.firstName = 'A';
    el.fields.lastName = 'B';
    el.fields.dateOfEmployment = '2025-01-01';
    el.fields.dateOfBirth = '2000-01-01';
    el.fields.department = 'Dept';
    el.fields.position = 'Analist';
    const valid = el.validate();
    assert.isFalse(valid, 'validate should return false on invalid patterns');
    assert.property(el.errors, 'email', 'errors.email should exist');
    assert.property(
      el.errors,
      'phoneNumber',
      'errors.phoneNumber should exist'
    );
  });

  test('onSubmit dispatches addEmployee when no id and valid', async () => {
    Object.assign(el.fields, {
      firstName: 'John',
      lastName: 'Doe',
      dateOfEmployment: '2025-01-01',
      dateOfBirth: '2000-01-01',
      phoneNumber: '0555123456',
      email: 'john@example.com',
      department: 'Dept',
      position: 'Uzman',
    });
    await el.updateComplete;
    const form = el.shadowRoot.querySelector('form');
    form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
    await el.updateComplete;
    assert.isTrue(
      dispatchedActions.length >= 1,
      'at least one action dispatched'
    );
    const action = dispatchedActions.find(
      (a) => a.type === addEmployee('').type
    );
    assert.ok(action, 'addEmployee action should be dispatched');
  });

  test('onSubmit dispatches updateEmployee when id is set', async () => {
    el.id = 42;
    el.employees = [
      {
        id: 42,
        firstName: 'X',
        lastName: 'Y',
        dateOfEmployment: '2020-01-01',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0555123456',
        email: 'x@y.com',
        department: 'D',
        position: 'Analist',
      },
    ];
    Object.assign(el.fields, el.employees[0]);
    await el.updateComplete;
    const form = el.shadowRoot.querySelector('form');
    form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
    await el.updateComplete;
    const action = dispatchedActions.find(
      (a) => a.type === updateEmployee({}).type
    );
    assert.ok(action, 'updateEmployee action should be dispatched');
  });
});
