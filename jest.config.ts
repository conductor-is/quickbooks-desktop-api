// eslint-disable-next-line consistent-default-export-name/default-export-match-filename, consistent-default-export-name/default-import-match-filename, import/no-extraneous-dependencies -- We must name the file `jest.config`, which we cannot name an import or export.
import baseChildConfig from "@conductor/client-node/../../../jest.config.base";

// Object must be cloned.
const config = {
  ...baseChildConfig,
};

export default config;
