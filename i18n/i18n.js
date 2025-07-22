import en from './locales/en';
import tr from './locales/tr';
import {store} from '../store.js';

const resources = {en, tr};
let locale = 'en';

const listeners = [];

export function changeLocale(newLocale) {
  if (resources[newLocale] && newLocale !== locale) {
    locale = newLocale;
    listeners.forEach((cb) => cb(locale));
  }
}

export function t(key) {
  const locale = store.getState().locale;
  return (resources[locale] && resources[locale][key]) || key;
}

export function onLocaleChange(cb) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function getLocale() {
  return locale;
}
