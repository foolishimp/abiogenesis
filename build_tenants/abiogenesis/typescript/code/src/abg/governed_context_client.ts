#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { connect } from "node:net";
import { fileURLToPath } from "node:url";

import { admitGovernedContextRequest, GOVERNED_CONTEXT_ENDPOINT_ENV, GOVERNED_CONTEXT_MAX_PAGE_BYTES, type GovernedContextRequest } from "./governed_context.js";

/**
 * Fixed installed governed-context client. It forwards exactly
 * {requestId,key,offset,maxBytes} to the per-occurrence owner endpoint named
 * by the owner-supplied environment and writes the exact response bytes to
 * stdout without a trailing newline. It selects no authority, path, grant or
 * Context.
 */
export function requestGovernedContext(endpoint: string, request: GovernedContextRequest, timeoutMs = 30000): Promise<Buffer> {
  const admitted = admitGovernedContextRequest(request);
  // Response bound: one base64 page plus its fixed identity envelope.
  const maxResponse = Math.ceil(GOVERNED_CONTEXT_MAX_PAGE_BYTES / 3) * 4 + 65536;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const socket = connect(endpoint);
    socket.setTimeout(timeoutMs, () => socket.destroy(new Error("governed context endpoint timed out")));
    socket.on("connect", () => socket.write(JSON.stringify({ requestId: admitted.requestId, key: admitted.key,
      offset: admitted.offset, maxBytes: admitted.maxBytes }) + "\n"));
    socket.on("data", chunk => {
      size += chunk.length;
      if (size > maxResponse) { socket.destroy(new Error("governed context response exceeds its bound")); return; }
      chunks.push(chunk);
    });
    socket.on("error", reject);
    socket.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function main(argv: readonly string[]): Promise<number> {
  const endpoint = process.env[GOVERNED_CONTEXT_ENDPOINT_ENV];
  if (endpoint === undefined || endpoint.length === 0 || argv.length !== 1) {
    process.stderr.write(`usage: ${GOVERNED_CONTEXT_ENDPOINT_ENV} must be owner-supplied; one argument {"requestId","key","offset","maxBytes"}\n`);
    return 2;
  }
  let request: GovernedContextRequest;
  try { request = admitGovernedContextRequest(JSON.parse(argv[0]!)); }
  catch (error) { process.stderr.write(`governed context request refused: ${error instanceof Error ? error.message : "invalid"}\n`); return 2; }
  try {
    const response = await requestGovernedContext(endpoint, request);
    await new Promise<void>(done => process.stdout.write(response, () => done()));
    return 0;
  } catch (error) {
    process.stderr.write(`governed context endpoint unavailable: ${error instanceof Error ? error.message : "closed"}\n`);
    return 3;
  }
}

const invoked = process.argv[1] === undefined ? null : (() => { try { return realpathSync(process.argv[1]!); } catch { return null; } })();
if (invoked !== null && invoked === realpathSync(fileURLToPath(import.meta.url))) {
  void main(process.argv.slice(2)).then(code => { process.exitCode = code; });
}
