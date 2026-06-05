
import { DEFAULT_LOCALE, RTL_LOCALES, STORAGE_KEY, resolveLocale, t, tSegments, type Locale, type Segment } from './i18n';

function getSavedLocale(): Locale {
  try {
    return resolveLocale(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

function applyToRoot(locale: Locale): void {
  const root = document.documentElement;
  root.setAttribute('lang', locale);
  root.setAttribute('dir', RTL_LOCALES.has(locale) ? 'rtl' : 'ltr');
}

function renderSegments(parent: Element, segments: Segment[]): void {
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  for (const seg of segments) {
    if (seg.bold) {
      const tag = seg.strong ? 'strong' : 'em';
      const wrap = document.createElement(tag);
      wrap.textContent = seg.text;
      parent.appendChild(wrap);
    } else {
      parent.appendChild(document.createTextNode(seg.text));
    }
  }
}

function applyToElement(el: Element, locale: Locale): void {
  const key = el.getAttribute('data-i18n');
  if (key) {
    el.textContent = t(locale, key);
  }
  const emphKey = el.getAttribute('data-i18n-emph');
  if (emphKey) {
    renderSegments(el, tSegments(locale, emphKey));
  }
  const attrSpec = el.getAttribute('data-i18n-attr');
  if (attrSpec) {
    for (const pair of attrSpec.split(/\s+/).filter(Boolean)) {
      const [attr, attrKey] = pair.split(':');
      if (attr && attrKey) {
        el.setAttribute(attr, t(locale, attrKey));
      }
    }
  }
}

export function applyLocale(locale: Locale): void {
  applyToRoot(locale);
  document.querySelectorAll('[data-i18n], [data-i18n-attr], [data-i18n-emph]').forEach((el) => {
    applyToElement(el, locale);
  });
  document.dispatchEvent(new CustomEvent('at75:locale-changed', { detail: { locale } }));
}

export function initI18n(): void {
  applyLocale(getSavedLocale());
}
