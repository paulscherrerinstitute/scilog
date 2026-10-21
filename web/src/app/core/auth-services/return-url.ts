import { DefaultUrlSerializer, PRIMARY_OUTLET } from '@angular/router';

const DEFAULT_RETURN_URL = '/overview';

// Placeholder origin: a path inside the app keeps it when parsed against it,
// anything pointing elsewhere (e.g. //host, /\host, https://host) does not.
const BASE = new URL('http://return-url.invalid');

// Public pages of the login flow. Never go back to them after login, and
// never copy their URL, which can hold a token, into a return address.
const AUTH_PAGES = ['login', 'auth-callback'];

// The router reads URLs with the `UrlSerializer` the app provides. The app
// keeps Angular's default, so this reads paths the same way the router does.
const serializer = new DefaultUrlSerializer();

/**
 * Returns `value` if it is a page of this app to go back to after login,
 * otherwise undefined. Only same-origin paths are accepted, and never a page
 * of the login flow.
 */
export function safeReturnUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined;
  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return undefined;
  }
  if (url.origin !== BASE.origin || isAuthPage(url.pathname)) return undefined;
  const path = url.pathname + url.search + url.hash;
  // dot segments can collapse e.g. /..//host into //host, another site
  return path.startsWith('//') ? undefined : path;
}

/** The page to open after login: `returnUrl` if it is a page of this app, else the overview. */
export function afterLoginUrl(returnUrl: unknown): string {
  return safeReturnUrl(returnUrl) ?? DEFAULT_RETURN_URL;
}

/**
 * Whether `path` opens a page of the login flow. It is read the way the
 * router reads it, so e.g. /login;a=1, /login(settings:x) and /%6Cogin count.
 * A path the router cannot read counts too, so it is never used.
 */
export function isAuthPage(path: string): boolean {
  try {
    const first = serializer.parse(path).root.children[PRIMARY_OUTLET]?.segments[0]?.path;
    return AUTH_PAGES.includes(first);
  } catch {
    return true;
  }
}

/** The login page, set up to go back to `returnUrl` if it is a page of this app. */
export function loginUrl(returnUrl?: unknown): string {
  const safe = safeReturnUrl(returnUrl);
  return safe ? `/login?${new URLSearchParams({ returnUrl: safe })}` : '/login';
}
