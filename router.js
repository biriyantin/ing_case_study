const routes = [
  {path: '', component: 'employee-list'},
  {path: '#/employees', component: 'employee-list'},
  {path: '#/employees/new', component: 'employee-form'},
  {path: '#/employees/:id/edit', component: 'employee-form'},
];

export function initRouter() {
  function onRouteChange() {
    const hash = window.location.hash || '#/employees';

    const route =
      routes.find((r) => {
        if (r.path.includes(':id')) {
          const base = r.path.split('/:')[0];
          return hash.startsWith(base);
        }
        return r.path === hash;
      }) || routes[1];

    let id = null;
    if (route.path.includes(':id')) {
      id = hash.split('/')[2];
    }

    const app = document.querySelector('main-page');
    app.innerHTML = `<${route.component}${id ? ` id="${id}"` : ''}></${
      route.component
    }>`;
  }

  window.addEventListener('hashchange', onRouteChange);

  onRouteChange();
}
