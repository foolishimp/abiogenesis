import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicBootloaderRequest
} from "../../build/semantic/code/src/app/m04/index.js";
import { bootloaderPayload } from "./support/bootloader-fixtures.mjs";

test("M04 bootloader unit: admitted request preserves explicit document and instruction targets", () => {
  const request = admitPublicBootloaderRequest(
    bootloaderPayload("/tmp/abiogenesis-bootloader-root")
  );

  assert.equal(request.targetRoot.rootPath, "/tmp/abiogenesis-bootloader-root");
  assert.equal(request.bootloaderDocument.relativePath, "docs/GTL_BOOTLOADER.md");
  assert.equal(request.instructionTargets.length, 2);
  assert.deepStrictEqual(
    request.instructionTargets.map((entry) => entry.relativePath),
    ["AGENTS.md", "CLAUDE.md"]
  );
});

test("M04 bootloader unit: admission rejects empty instruction target sets", () => {
  assert.throws(
    () =>
      admitPublicBootloaderRequest(
        bootloaderPayload("/tmp/abiogenesis-bootloader-root", {
          instructionTargets: []
        })
      ),
    /at least one instruction target/i
  );
});

test("M04 bootloader unit: admission rejects equal start and end markers", () => {
  assert.throws(
    () =>
      admitPublicBootloaderRequest(
        bootloaderPayload("/tmp/abiogenesis-bootloader-root", {
          bootloaderDocument: {
            relativePath: "docs/GTL_BOOTLOADER.md",
            content: "# bootloader",
            markers: {
              startMarker: "<!-- SAME -->",
              endMarker: "<!-- SAME -->"
            }
          }
        })
      ),
    /must differ/i
  );
});
