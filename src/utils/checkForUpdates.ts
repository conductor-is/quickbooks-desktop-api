import packageJson from "@conductor/client-node/../package.json";
import { isEnvironmentVariableTruthy } from "@conductor/client-node/utils/env";
import axios from "axios";

export function checkForUpdates(): void {
  // eslint-disable-next-line @typescript-eslint/dot-notation -- ESLint is incorrectly following the global type modification that `next` makes in other packages of this monorepo where it is a dependency. TypeScript correctly limits the scope of this `next` type modification to only the packages where `next` is a dependency. ESLint does not; hence, we disable this rule here.
  if (process.env["NODE_ENV"] === "test") {
    return;
  }

  // `CONDUCTOR_HIDE_UPDATE_MESSAGE` hides the update message that is logged
  // when a newer version of `conductor-node` is available. It's a truthy value.
  if (isEnvironmentVariableTruthy("CONDUCTOR_HIDE_UPDATE_MESSAGE")) {
    return;
  }

  const currentVersion = packageJson.version;
  const packageName = encodeURIComponent(packageJson.name);

  axios
    .get<{ latest: string }>(
      `https://registry.npmjs.org/-/package/${packageName}/dist-tags`,
    )
    .then((response) => {
      const latestVersion = response.data.latest;

      if (currentVersion !== latestVersion) {
        let updateCommand = "npm install";
        if (process.env["npm_execpath"]?.includes("yarn") === true) {
          updateCommand = "yarn add";
        } else if (process.env["npm_execpath"]?.includes("pnpm") === true) {
          updateCommand = "pnpm add";
        }

        console.warn(
          createFramedMessage([
            `🟡 Update available for Conductor! ${currentVersion} -> ${latestVersion}`,
            "",
            "Run the following to update:",
            `  ${updateCommand} ${packageName}@latest`,
          ]),
        );
      }
    })
    .catch((error: unknown) => {
      console.debug("Failed to check for updates:", error);
    });
}

export function createFramedMessage(messageLines: string[]): string {
  const maxLength = Math.max(...messageLines.map((line) => line.length), 0);
  const paddingHorizontalLength = 2;

  return [
    // Top border of the box.
    `┌${"─".repeat(maxLength + paddingHorizontalLength * 2)}┐`,

    // Print each line of the message, padded to fit the box.
    ...messageLines.map((line) => {
      const paddingLine = " ".repeat(maxLength - line.length);
      const paddingHorizontal = " ".repeat(paddingHorizontalLength);
      return `│${paddingHorizontal}${line}${paddingLine}${paddingHorizontal}│`;
    }),

    // Bottom border of the box.
    `└${"─".repeat(maxLength + paddingHorizontalLength * 2)}┘`,
  ].join("\n");
}
