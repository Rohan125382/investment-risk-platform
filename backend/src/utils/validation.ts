export function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value: unknown) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
