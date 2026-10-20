#!/usr/bin/env node
import { isRecord, hasExactKeys } from "../shared/admission_predicates.js";
import { readFile } from "node:fs/promises";
import { validateEventStoreCloseHandoff, } from "../abg/event_store.js";
import { canonicalJson } from "../product/index.js";
import { runInstalledDefinitionCallTransport, } from "./installed_definition_call_transport.js";
function parseTransportRequest(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "acquisition",
            "invocation",
            "kind",
            "schemaVersion",
        ]) ||
        value.kind !== "abg_cli_transport_request" ||
        value.schemaVersion !== "5.0.0" ||
        !isRecord(value.acquisition))
        return null;
    const acquisition = value.acquisition;
    if (acquisition.kind === "eventless" && hasExactKeys(acquisition, ["kind"])) {
        return value;
    }
    if (acquisition.kind === "new" &&
        hasExactKeys(acquisition, ["eventLogPath", "kind"]) &&
        typeof acquisition.eventLogPath === "string" &&
        acquisition.eventLogPath.length > 0)
        return value;
    if (acquisition.kind === "reopen" &&
        hasExactKeys(acquisition, ["closeHandoff", "kind"]) &&
        validateEventStoreCloseHandoff(acquisition.closeHandoff))
        return value;
    return null;
}
function transportRefusal(code, message) {
    return {
        kind: "public_transport_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
function writeJsonLine(value) {
    process.stdout.write(`${canonicalJson(value)}\n`);
}
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== "--jsonl" || args[1] === undefined) {
    writeJsonLine(transportRefusal("invalid_arguments", "abg.cli requires exactly --jsonl <explicit-transport-request-file>"));
    process.exitCode = 2;
}
else {
    try {
        const lines = (await readFile(args[1], "utf8"))
            .split(/\r?\n/u)
            .filter((line) => line.trim().length !== 0);
        if (lines.length !== 1) {
            writeJsonLine(transportRefusal("invalid_transport_request", "request file must contain one explicit CLI transport request"));
            process.exitCode = 2;
        }
        else {
            let decoded;
            try {
                decoded = JSON.parse(lines[0]);
            }
            catch {
                writeJsonLine(transportRefusal("invalid_json", "transport request file is not valid JSON"));
                process.exitCode = 2;
            }
            const request = parseTransportRequest(decoded);
            if (request === null) {
                if (decoded !== undefined) {
                    writeJsonLine(transportRefusal("invalid_transport_request", "transport request must declare exact acquisition and one Public invocation"));
                    process.exitCode = 2;
                }
            }
            else {
                const outcome = await runInstalledDefinitionCallTransport(request.acquisition, request.invocation);
                writeJsonLine(outcome);
                process.exitCode = outcome.kind ===
                    "installed_definition_call_transport_refusal"
                    ? 2
                    : outcome.receipt.exitCode;
            }
        }
    }
    catch (error) {
        writeJsonLine(transportRefusal("transport_failure", String(error)));
        process.exitCode = 2;
    }
}
