function roles(profile) {
  return (profile._json?.roles ?? []).reduce(
    (previousValue, currentValue) =>
      /^e[0-9]{5}$/.test(currentValue)
        ? previousValue.concat([currentValue, 'p' + currentValue.substring(1)])
        : previousValue.concat([currentValue]),
    [],
  );
}
exports.roles = roles
