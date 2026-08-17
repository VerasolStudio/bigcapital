// @ts-nocheck
import moment from 'moment';
import * as R from 'ramda';
import React from 'react';
import intl from 'react-intl-universal';
import { setLocale } from 'yup';
import { useWatchImmediate } from '../hooks';
import { AppIntlProvider } from './AppIntlProvider';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { useSplashLoading } from '@/hooks/state';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getPersistedLocale,
  isRTLLocale,
  isSupportedLocale,
  transformMomentLocale,
} from '@/constants/locales';

/**
 * Retrieve the current local.
 */
function getCurrentLocal() {
  const currentLocale = intl.determineLocale({
    urlLocaleKey: LOCALE_STORAGE_KEY,
    cookieLocaleKey: 'locale',
    localStorageLocaleKey: LOCALE_STORAGE_KEY,
  });
  if (isSupportedLocale(currentLocale)) {
    return currentLocale;
  }
  // Falls back to the persisted/browser locale before the default one, so a
  // Japanese browser lands on Japanese without an explicit selection.
  return getPersistedLocale() || DEFAULT_LOCALE;
}

/**
 * Loads the localization data of the given locale.
 */
async function loadLocales(currentLocale) {
  return await import(`../lang/${currentLocale}/index.json`).then(
    (module) => module.default,
  );
}

/**
 * Loads the localization data of yup validation library.
 */
async function loadYupLocales(currentLocale) {
  return await import(`../lang/${currentLocale}/locale.tsx`).then(
    (module) => module.locale,
  );
}

/**
 * Dynamically loads the moment.js locale bundle for the given locale.
 */
async function loadMomentLocale(currentLocale) {
  const momentLocale = transformMomentLocale(currentLocale);
  if (momentLocale === 'en') return;
  await import(`moment/locale/${momentLocale}`);
}

/**
 * Modifies the html document language and direction of the given locale.
 */
function useDocumentDirectionModifier(locale, isRTL) {
  React.useEffect(() => {
    const htmlDocument = document.querySelector('html');

    htmlDocument.setAttribute('lang', locale);
    htmlDocument.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL, locale]);
}

/**
 * Loads application locales of the given current locale.
 * @param {string} currentLocale
 * @returns {{ isLoading: boolean }}
 */
function useAppLoadLocales(currentLocale) {
  const [startLoading, stopLoading] = useSplashLoading();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Lodas the locales data file.
    loadLocales(currentLocale)
      .then((results) => {
        return intl.init({
          currentLocale,
          locales: {
            [currentLocale]: results,
          },
        });
      })
      .then(() => loadMomentLocale(currentLocale))
      .then(() => {
        moment.locale(transformMomentLocale(currentLocale));
        setIsLoading(false);
      });
  }, [currentLocale, stopLoading]);

  // Watches the value to start/stop splash screen.
  useWatchImmediate(
    (value) => (value ? startLoading() : stopLoading()),
    isLoading,
  );
  return { isLoading };
}

/**
 * Loads application yup locales based on the given current locale.
 * @param {string} currentLocale
 * @returns {{ isLoading: boolean }}
 */
function useAppYupLoadLocales(currentLocale) {
  const [startLoading, stopLoading] = useSplashLoading();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadYupLocales(currentLocale)
      .then((results) => {
        setLocale(results);
        setIsLoading(false);
      })
      .then(() => {});
  }, [currentLocale, stopLoading]);

  // Watches the valiue to start/stop splash screen.
  useWatchImmediate(
    (value) => (value ? startLoading() : stopLoading()),
    isLoading,
  );
  return { isLoading };
}

/**
 * Application Intl loader.
 */
function AppIntlLoader({ children }) {
  // Retrieve the current locale.
  const currentLocale = getCurrentLocal();

  // Detarmines the document direction based on the given locale.
  const isRTL = isRTLLocale(currentLocale);

  // Modifies the html document direction
  useDocumentDirectionModifier(currentLocale, isRTL);

  // Loads yup localization of the given locale.
  const { isLoading: isAppYupLocalesLoading } =
    useAppYupLoadLocales(currentLocale);

  // Loads application locales of the given locale.
  const { isLoading: isAppLocalesLoading } = useAppLoadLocales(currentLocale);

  // Detarmines whether the app locales loading.
  const isLoading = isAppYupLocalesLoading || isAppLocalesLoading;

  return (
    <AppIntlProvider currentLocale={currentLocale} isRTL={isRTL}>
      {isLoading ? null : children}
    </AppIntlProvider>
  );
}

export default R.compose(withDashboardActions)(AppIntlLoader);
