import {Profile} from 'passport';

export function roles(profile: Profile & {_json?: {roles?: string[]}}) {
  return (profile._json?.roles ?? []).reduce(
    (previousValue: string[], currentValue: string) =>
      /^e[0-9]{5}$/.test(currentValue)
        ? previousValue.concat([currentValue, 'p' + currentValue.substring(1)])
        : previousValue.concat([currentValue]),
    [],
  );
}
