import {Profile} from 'passport';

export function roles(profile: Profile & {_json?: {roles?: string[]}}) {
  if (profile.username && /^e[0-9]{5}$/.test(profile.username ?? ''))
    return (profile._json?.roles ?? []).concat([
      'p' + profile.username?.substring(1),
    ]);
  else return profile._json?.roles ?? [];
}
