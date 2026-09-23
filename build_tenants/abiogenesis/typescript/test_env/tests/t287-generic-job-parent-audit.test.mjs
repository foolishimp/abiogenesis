import { resolve } from "node:path";
import test from "node:test";
import { auditRetainedGenericParentGate } from "../support/t287-generic-job-parent-audit.mjs";
test("closed parent dispatch counterexample conserves every historical pre-effect guard relation", {
  skip: !process.env.ABI5_GENERIC_JOB_PARENT_GATE_ROOT, timeout: 180000 }, async () => {
  console.log(JSON.stringify(await auditRetainedGenericParentGate({ scratch: process.env.ABI5_GENERIC_JOB_PARENT_GATE_ROOT,
    sourceRoot: process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..") })));
});
