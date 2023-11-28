import packageJson from "@conductor/client-node/../package.json";
import childProcess from "node:child_process";

export function checkForUpdates(): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  // Exit early if npm is not installed.
  try {
    childProcess.execSync("which npm");
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
      `⚠️ Update available for Conductor: ${currentVersion} -> ${latestVersion}. To update, run: ${updateCommand} ${packageJson.name}@latest`,
    );
  }
}
