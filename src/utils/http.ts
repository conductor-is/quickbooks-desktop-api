export function getApiServerUrlForEnvironment(): string {
  // Do not check if `NODE_ENV` is "production" because that requires the
  // developer to have set `NODE_ENV` to use `conductor` as expected.
  if (["development", "test"].includes(process.env.NODE_ENV)) {
    return "http://localhost:4000";
  }
  return "https://api.conductor.is";
}
