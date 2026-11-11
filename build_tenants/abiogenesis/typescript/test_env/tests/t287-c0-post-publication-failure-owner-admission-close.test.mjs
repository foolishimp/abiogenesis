import test from "node:test";

import { installOncePerFile } from "../support/root-installed-environment.mjs";
import { installC0Tenant, runCase } from "../support/c0-post-publication-failure.mjs";

// B04-04, B04-05, B04-07 and B04-C01; B04-06 through B04-03 are in t287-c0-post-publication-failure.test.mjs.
const cases = [
  ["B04-04 owner-read", { modes: ["owner_read"] }],
  ["B04-04 owner-mismatch", { modes: ["owner_mismatch"] }],
  ["B04-05 append-complete", { modes: ["append"] }],
  ["B04-05 append-publication-only", { modes: ["staging_cleanup", "append"] }],
  ["B04-05 append-retained-receipt", { modes: ["inventory_read", "append"] }],
  ["B04-05 result-rejection-complete", { reject: "result" }],
  ["B04-05 evidence-rejection-publication-only", { modes: ["staging_cleanup"], reject: "evidence" }],
  ["B04-05 result-rejection-retained-receipt", { modes: ["inventory_read"], reject: "result" }],
  ["B04-07 stale-O0", { replace: true, modes: ["stale"] }],
  ["B04-07 failed-link", { modes: ["publication_syscall"] }],
  ["B04-07 failed-rename", { replace: true, modes: ["publication_syscall"] }],
  ["B04-C01 link-read-close", { modes: ["successor_read_close"] }],
  ["B04-C01 rename-read-close", { replace: true, modes: ["successor_read_close"] }],
  ["B04-C01 owner-read-close", { modes: ["owner_read_close"] }],
  ["B04-C01 close-only", { modes: ["successor_close"] }],
];
// The cases share one packed, verified and installed Product for this file;
// each case opens its own store, workspace and scratch root on it.
const sharedInstall = installOncePerFile(installC0Tenant);
for (const [name, options] of cases) test(`${name}: installed owner, ABG admission and fresh replay`, context => runCase(context, name.replaceAll(" ", "-"), options, sharedInstall));
