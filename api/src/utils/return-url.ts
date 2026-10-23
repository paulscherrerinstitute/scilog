import {Session} from '@loopback/rest';

const SESSION_KEY = 'returnUrl';

/**
 * Keeps the page to go back to in the session, replacing any earlier one.
 * The value is kept as is: the web app checks it before it navigates there.
 */
export function saveReturnUrl(session: Session, value: unknown) {
  if (typeof value === 'string' && value) session[SESSION_KEY] = value;
  else delete session[SESSION_KEY];
}

/** Takes the page to go back to out of the session, so it is used once. */
export function takeReturnUrl(session: Session): string | undefined {
  const returnUrl = session[SESSION_KEY];
  delete session[SESSION_KEY];
  return returnUrl;
}
