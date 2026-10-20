import { runWorkerTransport } from "../../../build/code/src/abg/worker_transport.js";
import { constructKnownWorkerTransportContract } from "../../../build/code/src/abg/transport_contracts.js";
import { resolve } from "node:path";

await runWorkerTransport({
  contract: constructKnownWorkerTransportContract("generic", {
    command: process.execPath, prefixArgs: [resolve(import.meta.dirname, "process-worker.mjs")], environment: {},
  }),
  prompt: "retain this prompt", lane: "worker_executes", cwd: process.argv[2],
  archiveRoot: process.argv[2], label: "interrupted", timeoutMs: 10000,
  environment: { T287_SUPERVISION_MODE: "archive" },
  observer: {
    onProcessStarted(pid) { process.send({ kind: "started", pid }); },
    onStdoutObserved() { process.send({ kind: "stdout" }); return true; },
    onStderrObserved() { process.send({ kind: "stderr" }); return true; },
  },
});
