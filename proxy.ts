import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getPreferredLocale, hasLocale } from '@/i18n/config';

const PUBLIC_FILE = /\.(?:.*)$/;

const getLocaleFromPathname = (pathname: string): string | null => {
  const segment = pathname.split('/')[1];
  return segment || null;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPathname(pathname);

  // Persist locale preference when locale segment exists
  if (localeFromPath && hasLocale(localeFromPath)) {
    const response = NextResponse.next();
    response.cookies.set('wrti-locale', localeFromPath, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const localeCookie = request.cookies.get('wrti-locale')?.value;
  const locale =
    localeCookie && hasLocale(localeCookie)
      ? localeCookie
      : getPreferredLocale(request.headers.get('accept-language')) || defaultLocale;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
