import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export function runtimePackageContractPayload(overrides = {}) {
  return {
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "0.0.0-test",
    dependencyRef: "file:../../build_tenants/abiogenesis/typescript",
    appExportSubpath: "./app/m04",
    requiredExports: Object.freeze([
      ".",
      "./app/m04",
      "./app/m04/control",
      "./app/m04/event-ingress"
    ]),
    ...overrides
  };
}

export function installBootstrapPayload(targetRoot, overrides = {}) {
  return {
    targetRoot: {
      rootPath: targetRoot
    },
    installedPackageName: "abiogenesis-installed-runtime",
    runtimePackage: runtimePackageContractPayload(),
    ...overrides
  };
}

export async function makeInstallTargetRoot() {
  return mkdtemp(path.join(tmpdir(), "abiogenesis-ts-install-"));
}

export function nodeInstallWriter() {
  return Object.freeze({
    async ensureDirectory(targetPath) {
      await mkdir(targetPath, { recursive: true });
    },
    async writeTextFile(targetPath, content) {
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, content, "utf8");
    },
    async readTextFile(targetPath) {
      try {
        return await readFile(targetPath, "utf8");
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "ENOENT") {
            return null;
          }
        }
        throw error;
      }
    },
    async isDirectory(targetPath) {
      try {
        return (await stat(targetPath)).isDirectory();
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "ENOENT") {
            return false;
          }
        }
        throw error;
      }
    },
    async isFile(targetPath) {
      try {
        return (await stat(targetPath)).isFile();
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "ENOENT") {
            return false;
          }
        }
        throw error;
      }
    }
  });
}
