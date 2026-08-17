import { SUPPORTED_LOCALES } from './locales';

/**
 * Retrieves the languages the application can be displayed in. The label shows
 * the language in its own script so it stays readable whatever the current
 * locale is.
 */
export const getLanguages = (): Array<{ name: string; value: string }> =>
  SUPPORTED_LOCALES.map(({ value, nativeName }) => ({
    name: nativeName,
    value,
  }));
