import { notFound } from 'next/navigation';
import { hasLocale, locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  return children;
}
