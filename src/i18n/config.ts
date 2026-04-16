export const locales = ['zh-CN', 'en-US'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

export const hasLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale);
};

export const getPreferredLocale = (acceptLanguageHeader: string | null): Locale => {
  if (!acceptLanguageHeader) return defaultLocale;

  const normalized = acceptLanguageHeader.toLowerCase();
  if (normalized.includes('en')) return 'en-US';

  return defaultLocale;
};
