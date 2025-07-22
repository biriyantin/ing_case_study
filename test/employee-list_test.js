import './polyfill.js';
import {fixture, assert, html} from '@open-wc/testing';
import '../components/employee-list.js';
import {mockEmployees} from '../data/employees.js';

suite('employee-list', () => {
  let el;

  setup(async () => {
    el = await fixture(html`<employee-list></employee-list>`);
    el.employees = mockEmployees;
    await el.updateComplete;
  });

  test('is defined and renders rows', () => {
    assert.instanceOf(el, customElements.get('employee-list'));
    const rows = el.shadowRoot.querySelectorAll('.table-body tbody tr');
    assert.equal(
      rows.length,
      el.listPageSize,
      'renders number of rows equal to listPageSize'
    );
  });

  test('filter input reduces the number of rows', async () => {
    const input = el.shadowRoot.querySelector('input[type="text"]');
    input.value = mockEmployees[0].firstName;
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    const rows = el.shadowRoot.querySelectorAll('.table-body tbody tr');
    assert.isAtMost(
      rows.length,
      mockEmployees.length,
      'filtered rows count should be ≤ total employees'
    );
    rows.forEach((tr) => {
      assert.include(
        tr.textContent.toLowerCase(),
        mockEmployees[0].firstName.toLowerCase()
      );
    });
  });

  test('toggleView renders card layout when in card mode', async () => {
    assert.isNull(
      el.shadowRoot.querySelector('.card-container'),
      'no card container in list mode'
    );
    el.toggleView('card');
    await el.updateComplete;
    assert.ok(
      el.shadowRoot.querySelector('.card-container'),
      'renders card container in card mode'
    );
  });

  test('formatPhone outputs the expected format', () => {
    const raw = '05551234567';
    const formatted = el.formatPhone(raw);
    assert.match(
      formatted,
      /^\(\d{3}\) \d{3} \d{2} \d{2}$/,
      'phone number should match (XXX) XXX XX XX'
    );
  });

  test('formatDate outputs TR locale date format', () => {
    const iso = '2025-07-22T00:00:00Z';
    const formatted = el.formatDate(iso);
    assert.match(
      formatted,
      /^\d{1,2}\.\d{1,2}\.\d{4}$/,
      'date should match DD.MM.YYYY format'
    );
  });
});
