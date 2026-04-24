import test from "node:test";
import assert from "node:assert/strict";

import {
  constructDeliveryPlan,
  constructInstructionInjectionContract,
  injectMarkedSection
} from "../../build/semantic/code/src/shared/abg_delivery_library/index.js";

test("ABG common delivery library unit: delivery plan preserves nested directory and file refs", () => {
  const plan = constructDeliveryPlan({
    directories: [{ kind: "runtime_root", relativePath: ".ai-workspace/runtime" }],
    files: [{ kind: "bootstrap_entry", relativePath: "bootstrap/index.mjs", content: "export {};\n" }]
  });

  assert.deepStrictEqual(plan, {
    directories: [{ kind: "runtime_root", relativePath: ".ai-workspace/runtime" }],
    files: [{ kind: "bootstrap_entry", relativePath: "bootstrap/index.mjs", content: "export {};\n" }]
  });
});

test("ABG common delivery library unit: marker injection appends a bounded section when none exists", () => {
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
  const result = injectMarkedSection("# local notes\n", contract);

  assert.equal(result.kind, "updated");
  assert.match(result.content, /GTL_BOOTLOADER_START/);
  assert.match(result.content, /# local notes/);
  assert.match(result.content, /# bootloader/);
});

test("ABG common delivery library unit: marker injection is idempotent for unchanged content", () => {
  const contract = constructInstructionInjectionContract({
    markers: {
      startMarker: "<!-- GTL_BOOTLOADER_START -->",
      endMarker: "<!-- GTL_BOOTLOADER_END -->"
    },
    targetFile: {
      relativePath: "CLAUDE.md"
    },
    sectionContent: "# bootloader"
  });
  const installed = "<!-- GTL_BOOTLOADER_START -->\n# bootloader\n<!-- GTL_BOOTLOADER_END -->\n";
  const result = injectMarkedSection(installed, contract);

  assert.deepStrictEqual(result, {
    kind: "unchanged",
    content: installed
  });
});
