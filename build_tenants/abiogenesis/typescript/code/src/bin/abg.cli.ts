#!/usr/bin/env node
// Implements: T-223 DS-1 native graph-shell adapter

import { runAbgCli } from "../app/m04/public_cli/index.js";

process.exitCode = await runAbgCli(process.argv.slice(2), {
  cwd: () => process.cwd(),
  stdout: (text) => {
    process.stdout.write(text);
  },
  stderr: (text) => {
    process.stderr.write(text);
  }
});
