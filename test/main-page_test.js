import './polyfill.js';
import {fixture, assert, html} from '@open-wc/testing';
import '../components/main-page.js';

suite('main-page', () => {
  test('is defined', () => {
    const el = document.createElement('main-page');
    assert.instanceOf(el, customElements.get('main-page'));
  });

  test('renders basic structure', async () => {
    const el = await fixture(html`<main-page></main-page>`);
    assert.ok(el.shadowRoot.querySelector('nav'), '<nav> should be present');
    assert.equal(
      el.shadowRoot.querySelector('.nav-title').textContent.trim(),
      'ING'
    );
    assert.equal(
      el.shadowRoot.querySelectorAll('.nav-right > button').length,
      2,
      'should have two nav buttons'
    );
    const pc = el.shadowRoot.querySelector('#page-container');
    assert.ok(pc, '#page-container should be present');
    assert.ok(
      pc.querySelector('slot'),
      'slot should be inside #page-container'
    );
  });

  test('language dropdown toggles open/closed', async () => {
    const el = await fixture(html`<main-page></main-page>`);
    const btn = el.shadowRoot.querySelector('.lang-button');
    assert.isNull(el.shadowRoot.querySelector('.lang-dropdown'));
    btn.click();
    await el.updateComplete;
    assert.ok(el.shadowRoot.querySelector('.lang-dropdown'));
    btn.click();
    await el.updateComplete;
    assert.isNull(el.shadowRoot.querySelector('.lang-dropdown'));
  });

  test('lang-button img src and alt reflect locale attribute', async () => {
    const el = await fixture(html`<main-page locale="tr"></main-page>`);
    const img = el.shadowRoot.querySelector('.lang-button img');
    assert.equal(img.alt, 'tr', 'alt should match locale');
    assert.include(img.src, '/flags/tr.svg', 'src should point to tr.svg');
  });

  test('toggleDropdown() method toggles dropdownOpen property', async () => {
    const el = await fixture(html`<main-page></main-page>`);
    assert.isFalse(el.dropdownOpen, 'dropdownOpen should start false');
    el.toggleDropdown();
    assert.isTrue(el.dropdownOpen, 'dropdownOpen should be true after toggle');
    el.toggleDropdown();
    assert.isFalse(
      el.dropdownOpen,
      'dropdownOpen should be false after second toggle'
    );
  });

  test('renders language options when dropdownOpen is true', async () => {
    const el = await fixture(html`<main-page></main-page>`);
    el.dropdownOpen = true;
    await el.updateComplete;
    const options = el.shadowRoot.querySelectorAll('.lang-dropdown button');
    assert.equal(options.length, 2, 'there should be two language options');
    assert.include(options[0].textContent.trim(), 'English');
    assert.include(options[1].textContent.trim(), 'Türkçe');
  });
});
