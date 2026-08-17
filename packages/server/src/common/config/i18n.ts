import { registerAs } from '@nestjs/config';

/**
 * Locales the server ships translation bundles for under `src/i18n/{locale}`.
 */
export const SUPPORTED_LOCALES = ['en', 'ja'];

export default registerAs('i18n', () => ({
  /**
   * Used when the request carries no resolvable locale, or carries one that
   * has no shipped bundle.
   */
  fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
}));
