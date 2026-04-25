#!/usr/bin/env node
// Implements: REQ-P-POLICY-017

import { runAbiogenesisCli } from "../cli/command.js";

process.exitCode = await runAbiogenesisCli(process.argv.slice(2), {
  cwd: () => process.cwd(),
  stdout: (text) => {
    process.stdout.write(text);
  },
  stderr: (text) => {
    process.stderr.write(text);
  }
});
