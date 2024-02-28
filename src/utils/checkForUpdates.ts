import packageJson from "@conductor/client-node/../package.json";
import { isEnvironmentVariableTruthy } from "@conductor/client-node/utils/env";
import childProcess from "node:child_process";

export function checkForUpdates(): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  // `CONDUCTOR_HIDE_UPDATE_MESSAGE` hides the update message that is logged
  // when a newer version of `conductor-node` is available. It's a truthy value.
  if (isEnvironmentVariableTruthy("CONDUCTOR_HIDE_UPDATE_MESSAGE")) {
    return;
  }

  // Exit early if `npm` is not installed.
  try {
    childProcess.execSync("npm --version", {
      // Prevent the shell from internally logging the error message.
      stdio: "ignore",
    });
  } catch {
    return;
  }

  const currentVersion = packageJson.version;
  const latestVersion = childProcess
    .execSync(`npm view ${packageJson.name} version --silent`)
    .toString()
    .trim();

  if (currentVersion !== latestVersion) {
    const updateCommand =
      process.env["npm_execpath"]?.includes("yarn") === true
        ? "yarn add"
        : "npm install";

    console.warn(
      createFramedMessage([
        `🟡 Update available for Conductor! ${currentVersion} -> ${latestVersion}`,
        "",
        "Run the following to update:",
        `  ${updateCommand} ${packageJson.name}@latest`,
      ]),
    );
  }
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
