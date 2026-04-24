import { installBootstrapPayload } from "./install-bootstrap-fixtures.mjs";

export function bootloaderPayload(targetRoot, overrides = {}) {
  return {
    targetRoot: {
      rootPath: targetRoot
    },
    bootloaderDocument: {
      relativePath: "docs/GTL_BOOTLOADER.md",
      content: "# GTL Bootloader\n\nBoot the runtime from admitted design truth.\n",
      markers: {
        startMarker: "<!-- GTL_BOOTLOADER_START -->",
        endMarker: "<!-- GTL_BOOTLOADER_END -->"
      }
    },
    instructionTargets: [
      { relativePath: "AGENTS.md" },
      { relativePath: "CLAUDE.md" }
    ],
    ...overrides
  };
}

export function installedRuntimePayload(targetRoot) {
  return installBootstrapPayload(targetRoot);
}
