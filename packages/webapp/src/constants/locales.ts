import { find } from 'lodash';
import rtlDetect from 'rtl-detect';

export interface LocaleDefinition {
  /** ISO 639-1 language code used as the locale bundle directory name. */
  value: string;

  /** Language name written in English. */
  name: string;

  /** Language name written in its own script. */
  nativeName: string;

  /**
   * Moment.js locale bundle name, when it differs from the locale value.
   * @see https://github.com/moment/moment/tree/develop/locale
   */
  momentLocale?: string;
}

/**
 * Locales the application ships translation bundles for.
 * Each entry requires a matching `src/lang/{value}` directory.
 */
export const SUPPORTED_LOCALES: LocaleDefinition[] = [
  { value: 'en', name: 'English', nativeName: 'English' },
  { value: 'ar', name: 'Arabic', nativeName: 'العربية', momentLocale: 'ar-ly' },
  { value: 'es', name: 'Spanish', nativeName: 'Español' },
  { value: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { value: 'ja', name: 'Japanese', nativeName: '日本語' },
];

export const DEFAULT_LOCALE = 'en';

/**
 * The local storage key the selected locale is persisted under. It is also
 * the key `intl.determineLocale()` reads on boot.
 */
export const LOCALE_STORAGE_KEY = 'lang';

/**
 * Detarmines whether the given locale has a shipped translation bundle.
 */
export const isSupportedLocale = (locale?: string | null): boolean =>
  !!locale && !!find(SUPPORTED_LOCALES, { value: locale });

/**
 * Retrieves the definition of the given locale, or the default locale one.
 */
export const getLocaleDefinition = (locale?: string | null): LocaleDefinition =>
  find(SUPPORTED_LOCALES, { value: locale as string }) ||
  (find(SUPPORTED_LOCALES, { value: DEFAULT_LOCALE }) as LocaleDefinition);

/**
 * Transformes the given locale to its moment.js locale bundle name.
 */
export const transformMomentLocale = (locale: string): string =>
  getLocaleDefinition(locale).momentLocale || getLocaleDefinition(locale).value;

/**
 * Detarmines whether the given locale is written right-to-left.
 */
export const isRTLLocale = (locale: string): boolean =>
  rtlDetect.isRtlLang(locale);

/**
 * Persists the given locale so the next application boot picks it up.
 */
export const persistLocale = (locale: string): void => {
  if (!isSupportedLocale(locale)) return;

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    // Ignore storage failures, the locale just won't be remembered.
  }
};

/**
 * The cookie key the organization language is mirrored to on dashboard boot.
 * @see `useApplicationBoot()`
 */
export const LOCALE_COOKIE_KEY = 'locale';

const readCookie = (name: string): string | null => {
  const matched = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return matched ? decodeURIComponent(matched[1]) : null;
};

const readLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const readUrlLocale = (): string | null =>
  new URLSearchParams(window.location.search).get(LOCALE_STORAGE_KEY);

/**
 * Retrieves the effective locale, falling back to the browser language and
 * then to the default locale. Resolved in the same precedence order as
 * `intl.determineLocale()` so both stay in sync, and kept synchronous so it
 * can be used outside of the React tree, e.g. by the http client.
 */
export const getPersistedLocale = (): string => {
  const candidates = [
    readUrlLocale(),
    readCookie(LOCALE_COOKIE_KEY),
    readLocalStorage(LOCALE_STORAGE_KEY),
    navigator.language?.split('-')[0],
  ];
  return (
    (candidates.find(isSupportedLocale) as string | undefined) || DEFAULT_LOCALE
  );
};
