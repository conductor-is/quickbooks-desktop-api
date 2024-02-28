/* eslint-disable import/no-import-module-exports -- We must use both `import` declarations and CommonJS exports to support both TypeScript/ESM and CommonJS. */

// eslint-disable-next-line consistent-default-export-name/default-export-match-filename -- This error complains, "The directory 'src' must be named 'Client', after the exported value of its index file". However, `src/` is the package root, not a typical module. The exported name is set via `main` in `package.json`, not by the directory name. Thus, we can ignore this error.
import Client from "@conductor/client-node/Client";
import * as ErrorModule from "@conductor/client-node/utils/error";

/**
 * CommonJS support:
 *   const Conductor = require("conductor-node");
 *   const { ConductorIntegrationError } = require("conductor-node");
 */
if (module.exports !== undefined) {
  module.exports = Client;
  // Required for when `esModuleInterop` is `false`.
  (module.exports as Record<string, unknown>)["default"] = Client;
  // Extend `module.exports` with the exports from `ErrorModule`.
  Object.assign(module.exports, ErrorModule);
}

/**
 * ESM support:
 *   import Conductor from "conductor-node";
 *   import { ConductorIntegrationError } from "conductor-node";
 *   import type { QbdTypes } from "conductor-node";
 */
// eslint-disable-next-line unicorn/prefer-export-from -- `Client` must be the default export, which is impossible to define with `export from`.
export default Client;
export type { ClientOptions } from "@conductor/client-node/Client";
export type * as QbdTypes from "@conductor/client-node/integrations/qbd/qbdTypes";
// Must come after `module.exports` above. Otherwise, it breaks the following in
// JavaScript ESM:
//   const { ConductorIntegrationError } = require("conductor-node");
export * from "@conductor/client-node/utils/error";
