// eslint-disable-next-line consistent-default-export-name/default-export-match-filename, consistent-default-export-name/default-import-match-filename, import/no-extraneous-dependencies -- We must name the file `jest.config`, which we cannot name an import or export.
import baseChildConfig from "@conductor/client-node/../../../jest.config.base";

// Object must be cloned.
const config = {
  ...baseChildConfig,
  // Run before each test suite after the test framework has been installed in
  // the environment (making Jest globals, `jest`, and `expect` accessible) but
  // before the test code itself.
  setupFilesAfterEnv: ["<rootDir>/src/utils/test/jestSetupAfterEnv.ts"],
};

export default config;
