import {Session} from '@loopback/rest';

// Placeholder origin: a path inside the app keeps it when parsed against it,
// anything pointing elsewhere (e.g. //host, /\host, https://host) does not.
const BASE = new URL('http://return-url.invalid');

const SESSION_KEY = 'returnUrl';

/**
 * Returns `value` as a page of the web app (path, query and hash) to go back
 * to after login, or undefined if it is not one, so it is safe to redirect
 * to. The login page itself is not accepted.
 */
export function safeReturnUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined;
  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return undefined;
  }
  if (url.origin !== BASE.origin) return undefined;
  if (url.pathname === '/login' || url.pathname.startsWith('/login/')) {
    return undefined;
  }
  const path = url.pathname + url.search + url.hash;
  // dot segments can collapse e.g. /..//host into //host, another site
  return path.startsWith('//') ? undefined : path;
}

/** Keeps the page to go back to in the session, replacing any earlier one. */
export function saveReturnUrl(session: Session, value: unknown) {
  const returnUrl = safeReturnUrl(value);
  if (returnUrl) session[SESSION_KEY] = returnUrl;
  else delete session[SESSION_KEY];
}

/** Takes the page to go back to out of the session, so it is used once. */
export function takeReturnUrl(session: Session): string | undefined {
  const returnUrl = safeReturnUrl(session[SESSION_KEY]);
  delete session[SESSION_KEY];
  return returnUrl;
}
