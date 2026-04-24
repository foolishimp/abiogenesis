import test from "node:test";
import assert from "node:assert/strict";

import {
  constructInstructionInjectionContract,
  injectMarkedSection
} from "../../build/semantic/code/src/shared/abg_delivery_library/index.js";

test("ABG common delivery library negative: mismatched instruction markers fail closed", () => {
  const contract = constructInstructionInjectionContract({
    markers: {
      startMarker: "<!-- GTL_BOOTLOADER_START -->",
      endMarker: "<!-- GTL_BOOTLOADER_END -->"
    },
    targetFile: {
      relativePath: "AGENTS.md"
    },
    sectionContent: "# bootloader"
  });

  assert.throws(
    () =>
      injectMarkedSection(
        "<!-- GTL_BOOTLOADER_START -->\n# old bootloader\n",
        contract
      ),
    /markers must appear together/i
  );
});
