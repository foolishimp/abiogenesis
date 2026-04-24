import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicBootloaderRequest
} from "../../build/semantic/code/src/app/m04/index.js";
import { bootloaderPayload } from "./support/bootloader-fixtures.mjs";

test("T-020 negative proof: bootloader rejects a relative target root", () => {
  assert.throws(
    () =>
      admitPublicBootloaderRequest(
        bootloaderPayload("/tmp/ignored", {
          targetRoot: {
            rootPath: "relative/bootloader-root"
          }
        })
      ),
    /absolute path/i
  );
});

test("T-020 negative proof: bootloader rejects empty document content", () => {
  assert.throws(
    () =>
      admitPublicBootloaderRequest(
        bootloaderPayload("/tmp/bootloader-root", {
          bootloaderDocument: {
            relativePath: "docs/GTL_BOOTLOADER.md",
            content: "",
            markers: {
              startMarker: "<!-- GTL_BOOTLOADER_START -->",
              endMarker: "<!-- GTL_BOOTLOADER_END -->"
            }
          }
        })
      ),
    /content/i
  );
});
