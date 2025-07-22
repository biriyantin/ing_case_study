import './components/main-page.js';
import './components/employee-list.js';
import './components/employee-form.js';
import {initRouter} from './router.js';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app-root');
  root.innerHTML = `<main-page></main-page>`;
  initRouter();
});
