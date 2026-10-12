export const DEFAULT_RETURN_URL = '/overview';

/**
 * Returns `value` if it is a page of this app to go back to after login,
 * otherwise undefined. Only same-origin paths are accepted, and never the
 * login page itself.
 */
export function safeReturnUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined;
  let url: URL;
  try {
    url = new URL(value, location.origin);
  } catch {
    return undefined;
  }
  if (url.origin !== location.origin || isLoginPage(url.pathname)) return undefined;
  const path = url.pathname + url.search + url.hash;
  // dot segments can collapse e.g. /..//host into //host, another site
  return path.startsWith('//') ? undefined : path;
}

export function isLoginPage(pathname: string): boolean {
  return pathname === '/login' || pathname.startsWith('/login/');
}

/** The login page, set up to go back to `returnUrl` if it is a page of this app. */
export function loginUrl(returnUrl?: unknown): string {
  const safe = safeReturnUrl(returnUrl);
  return safe ? `/login?returnUrl=${encodeURIComponent(safe)}` : '/login';
}
