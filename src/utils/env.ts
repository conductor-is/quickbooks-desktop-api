const FALSY_VALUES = new Set([
  undefined,
  "",
  "null",
  "undefined",
  "false",
  "0",
]);

export function isEnvironmentVariableTruthy(name: string): boolean {
  const value = process.env[name]?.toLowerCase();
  return !FALSY_VALUES.has(value);
}
