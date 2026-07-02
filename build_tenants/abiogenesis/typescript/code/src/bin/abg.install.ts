#!/usr/bin/env node
// Implements: REQ-P-INSTALL

import { runAbiogenesisCli } from "../cli/command.js";

process.exitCode = await runAbiogenesisCli(["context-bootstrap", ...process.argv.slice(2)], {
  cwd: () => process.cwd(),
  stdout: (text) => {
    process.stdout.write(text);
  },
  stderr: (text) => {
    process.stderr.write(text);
  }
});
