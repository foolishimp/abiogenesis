#!/usr/bin/env node
// Implements: REQ-F-ODDSDLC-040

import {
  invokeOddSdlcSpecMethodCommand,
  serializeOddSdlcSpecMethodResult
} from "../spec_method/index.js";

const result = await invokeOddSdlcSpecMethodCommand(process.argv.slice(2));
const output = serializeOddSdlcSpecMethodResult(result);
if (result.status === "error") {
  process.stderr.write(output);
} else {
  process.stdout.write(output);
}
process.exitCode = result.exitCode;
