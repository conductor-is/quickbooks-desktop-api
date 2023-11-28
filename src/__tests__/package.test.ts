import packageJson from "@conductor/client-node/../package.json";
import { generateTempFilePath } from "@conductor/client-node/utils/test/misc";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("package", () => {
  const clientPackagePath = "./packages/client-node/";
  const packageFilePath = generateTempFilePath("package", ".tgz");

  beforeAll(() => {
    // Automatically runs `yarn postpack` after `yarn pack`.
    execSync(
      `yarn --cwd=${clientPackagePath} --silent pack --filename=${packageFilePath}`,
      // Log everything to see TypeScript errors, which are output to stdout
      // (instead of stderr).
      { stdio: "inherit" },
    );
  });

  afterAll(() => {
    execSync(`rm -rf ${packageFilePath}`);
  });

  describe("has no dependencies that are linked/local packages (because it would break `yarn add`)", () => {
    it("has no dependencies who names includes 'conductor'", () => {
      const localPackages = [
        ...Object.keys(packageJson.dependencies),
        ...Object.keys(packageJson.devDependencies),
      ].filter((dependency) => dependency.includes("conductor"));
      expect(localPackages).toHaveLength(0);
    });
  });

  it("yarn pack creates tarball", () => {
    expect(fs.existsSync(packageFilePath)).toBe(true);
  });

  describe("tarball contains expected files", () => {
    const tarballRootDir = "package";
    const expectedFiles = [
      "package.json",
      "README.md",
      // `tsc` duplicates `package.json` to `dist/` because `Client.ts` imports
      // it as a module.
      "dist/package.json",
    ].map((file) => path.join(tarballRootDir, file));
    const tarballFilePaths: string[] = [];

    beforeAll(() => {
      const stdout = execSync(`tar -tf ${packageFilePath}`).toString();
      const tarballPaths = stdout.split("\n");
      tarballFilePaths.push(
        ...tarballPaths.filter((filePath) => filePath.includes(".")),
      );
    });

    it.each(expectedFiles)("%s", (expectedFilePath) => {
      expect(tarballFilePaths).toContain(expectedFilePath);
    });

    it("package.json#main", () => {
      expect(tarballFilePaths).toContain(
        `${tarballRootDir}/${packageJson.main}`,
      );
    });

    it("package.json#types", () => {
      expect(tarballFilePaths).toContain(
        `${tarballRootDir}/${packageJson.types}`,
      );
    });

    it("has no test directories", () => {
      expect(
        tarballFilePaths.filter((filePath) => filePath.includes("__tests__")),
      ).toHaveLength(0);
    });

    it("has no test files", () => {
      expect(
        tarballFilePaths.filter((filePath) => filePath.includes(".test.")),
      ).toHaveLength(0);
    });

    it("has no test utility files", () => {
      expect(
        tarballFilePaths.filter((filePath) => filePath.includes("/test/")),
      ).toHaveLength(0);
    });

    it("all other files begin with `dist/src/` and end with `.js` or `.d.ts`", () => {
      expect.hasAssertions();
      tarballFilePaths
        .filter((filePath) => !expectedFiles.includes(filePath))
        .forEach((filePath) => {
          expect(filePath).toMatch(
            new RegExp(`^${tarballRootDir}/dist/src/.*\\.(js|d\\.ts)$`),
          );
        });
    });
  });

  it("has no import path aliases (e.g., `@conductor/client-node/*`) in transpiled source - confirm `tsc-alias` replaced aliases with relative import paths", () => {
    expect.hasAssertions();

    // Output to a temporary file instead of piping because it exceeds the max
    // buffer size of 200 Kb.
    const tarballFilePath = generateTempFilePath("transpiled-source", ".tgz");
    execSync(`tar -xOf ${packageFilePath} > ${tarballFilePath}`);
    const transpiledSource = fs.readFileSync(tarballFilePath).toString();
    fs.rmSync(tarballFilePath);

    [
      ...transpiledSource.matchAll(/require\(["'](.*)["']\)/g),
      ...transpiledSource.matchAll(/import\s+.*\s+from\s+["'](.*)["']/g),
    ].forEach((match) => {
      expect(match[1]).not.toMatch(/^@conductor\/client-node/);
    });
  });

  describe("install and load package", () => {
    describe.each(["yarn add", "npm install"])("%s", (installCommand) => {
      const installDir = fs.mkdtempSync(`${os.tmpdir()}/test-install-`);

      beforeAll(() => {
        execSync(`${installCommand} ${packageFilePath}`, { cwd: installDir });
      });

      afterAll(() => {
        execSync(`rm -rf ${installDir}`);
      });

      it("installs the package", () => {
        const packageJsonPath = path.join(
          installDir,
          "node_modules",
          packageJson.name,
          "package.json",
        );
        const installedPackageJson = JSON.parse(
          fs.readFileSync(packageJsonPath).toString(),
        ) as typeof packageJson;
        expect(installedPackageJson.name).toBe(packageJson.name);
        expect(installedPackageJson.name).toBe("conductor-node");
        expect(installedPackageJson.version).toBe(packageJson.version);
      });

      describe("imports and instantiates the client, error subclasses, and types", () => {
        describe("TypeScript", () => {
          // Merge multiple tests into one because otherwise each additional
          // `ts-node -e` call adds ~1 second to the test suite.
          it("module", () => {
            expect(() =>
              // Use `ts-node` from the repo's `node_modules` to avoid having to
              // install it in `installDir`.
              execSync(
                `yarn --cwd=${__dirname} ts-node --eval="
                  // Imports and instantiates a Client in TypeScript.
                  import Conductor from 'conductor-node';
                  const conductor = new Conductor('mock-api-key');
                  console.log(conductor.constructor.name);

                  // Imports custom error subclasses from the main export.
                  import { ConductorIntegrationError } from 'conductor-node';
                  const integrationError = new ConductorIntegrationError({
                    message: 'test',
                    code: 'test',
                  });
                  console.log(integrationError);

                  // Imports types from the main export.
                  import type { QbdTypes } from 'conductor-node';
                  const defaultAccountType: QbdTypes.AccountType = 'Bank';
                  console.log(defaultAccountType);
                "`,
                { cwd: installDir },
              ),
            ).not.toThrow();
          });

          it("commonjs", () => {
            expect(() =>
              execSync(
                `yarn --cwd=${__dirname} ts-node --eval="
                  // Imports and instantiates a Client in TypeScript.
                  const Conductor = require('conductor-node');
                  const conductor = new Conductor('mock-api-key');
                  console.log(conductor.constructor.name);

                  // Imports custom error subclasses from the main export.
                  const { ConductorIntegrationError } = require('conductor-node');
                  const integrationError = new ConductorIntegrationError({
                    message: 'test',
                    code: 'test',
                  });
                  console.log(integrationError);

                  // Imports types from the main export.
                  const { QbdTypes } = require('conductor-node');
                  const defaultAccountType: QbdTypes.AccountType = 'Bank';
                  console.log(defaultAccountType);
                "`,
                { cwd: installDir },
              ),
            ).not.toThrow();
          });
        });

        describe("JavaScript", () => {
          it("module", () => {
            expect(() =>
              execSync(
                `node --input-type=module --eval="
                  // Imports and instantiates a Client in javascript ESM.
                  import Conductor from 'conductor-node';
                  const conductor = new Conductor('mock-api-key');
                  console.log(conductor.constructor.name);

                  // Imports custom error subclasses from the main export.
                  import { ConductorIntegrationError } from 'conductor-node';
                  const integrationError = new ConductorIntegrationError({
                    message: 'test',
                    code: 'test',
                  });
                  console.log(integrationError);
                "`,
                { cwd: installDir },
              ),
            ).not.toThrow();
          });

          it("commonjs", () => {
            expect(() =>
              execSync(
                `node --input-type=commonjs --eval="
                  // Imports and instantiates a Client in javascript CommonJS.
                  const Conductor = require('conductor-node');
                  const conductor = new Conductor('mock-api-key');
                  console.log(conductor.constructor.name);

                  // Imports custom error subclasses from the main export.
                  const { ConductorIntegrationError } = require('conductor-node');
                  const integrationError = new ConductorIntegrationError({
                    message: 'test',
                    code: 'test',
                  });
                  console.log(integrationError);
                "`,
                { cwd: installDir },
              ),
            ).not.toThrow();
          });
        });
      });
    });
  });
});
