import {Profile} from 'passport';

export const DEFAULT_ROLES_CLAIMS = ['roles'];

export function roles(
  profile: Profile & {_json?: Record<string, unknown>},
  rolesClaims: string[] = DEFAULT_ROLES_CLAIMS,
): string[] {
  const json = profile._json ?? {};
  const rolesFromProfile = rolesClaims.flatMap(claim => {
    const value = json[claim];
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === 'string')
      : [];
  });
  if (profile.username && /^e[0-9]{5}$/.test(profile.username ?? ''))
    return rolesFromProfile.concat(['p' + profile.username?.substring(1)]);
  else return rolesFromProfile;
}
