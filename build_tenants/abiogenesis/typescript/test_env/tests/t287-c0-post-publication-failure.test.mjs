import test from "node:test";

import { installOncePerFile } from "../support/root-installed-environment.mjs";
import { installC0Tenant, runCase } from "../support/c0-post-publication-failure.mjs";

// B04-06, B04-01, B04-02 and B04-03; B04-04 through B04-C01 are in t287-c0-post-publication-failure-owner-admission-close.test.mjs.
const cases = [
  ["B04-06 create", { authorizationControls: true }],
  ["B04-06 replace", { replace: true }],
  ["B04-01 cleanup-compensated", { modes: ["staging_cleanup"] }],
  ["B04-01 compensation-failed", { modes: ["staging_cleanup", "compensation_failure"] }],
  ["B04-01 identity-unavailable", { modes: ["staging_cleanup", "compensation_identity"] }],
  ["B04-01 persistent-staging", { modes: ["staging_cleanup", "persistent_cleanup"] }],
  ["B04-01 substituted-staging", { modes: ["staging_cleanup", "substituted_staging"] }],
  ["B04-01 residue-unknown", { modes: ["staging_cleanup", "residue_unknown"] }],
  ["B04-02 link-successor-read", { modes: ["successor_read"] }],
  ["B04-02 rename-successor-read", { replace: true, modes: ["successor_read"] }],
  ["B04-02 successor-mismatch", { modes: ["successor_mismatch"] }],
  ["B04-02 successor-absent", { modes: ["successor_absent"] }],
  ["B04-02 successor-nonfile", { modes: ["successor_nonfile"] }],
  ["B04-03 inventory-read", { modes: ["inventory_read"] }],
  ["B04-03 inventory-mismatch", { modes: ["inventory_mismatch"] }],
  ["B04-03 primary-cause-preserved", { modes: ["staging_cleanup", "inventory_read"] }],
];
// The cases share one packed, verified and installed Product for this file;
// each case opens its own store, workspace and scratch root on it.
const sharedInstall = installOncePerFile(installC0Tenant);
for (const [name, options] of cases) test(`${name}: installed owner, ABG admission and fresh replay`, context => runCase(context, name.replaceAll(" ", "-"), options, sharedInstall));
