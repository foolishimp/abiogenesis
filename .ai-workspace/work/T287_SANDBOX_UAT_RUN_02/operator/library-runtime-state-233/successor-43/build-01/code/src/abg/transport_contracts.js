import { deepFreeze } from "../shared/immutable.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
export function isNativeWorkerResultAssessment(value, output, resultContractRef, inputDigest) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return false;
    const a = value;
    if (Object.keys(a).sort().join("\0") !== ["kind", "schemaVersion", "resultContractRef", "inputDigest", "rawOutputDigest", "disposition", "verification"].sort().join("\0") ||
        a.kind !== "native_worker_result_assessment" || a.schemaVersion !== "5.0.0" || a.resultContractRef !== resultContractRef ||
        a.inputDigest !== inputDigest || a.rawOutputDigest !== sha256Bytes(output))
        return false;
    if (a.disposition !== "admitted")
        return a.verification === null &&
            (a.disposition === "absent" ? output.trim().length === 0 : a.disposition === "rejected" && output.trim().length !== 0);
    const p = a.verification;
    if (p === null || typeof p !== "object" || Object.keys(p).sort().join("\0") !== ["kind", "schemaVersion", "verificationRef", "verificationDigest", "contractCapabilityBasis", "implementationResolutionDigest", "implementationRef", "inputContractRef", "targetOutputContractRef", "instructionContractRef", "rawResultContractRef", "inputDigest", "rawResultDigest"].sort().join("\0") ||
        p.kind !== "verified_probabilistic_result_contract_preimage" || p.schemaVersion !== "5.0.0" ||
        p.inputDigest !== inputDigest || p.rawResultContractRef !== resultContractRef ||
        typeof p.contractCapabilityBasis !== "object" || p.contractCapabilityBasis === null ||
        Object.keys(p.contractCapabilityBasis).sort().join("\0") !== ["installId", "implementationSetRef", "implementationSetDigest", "publicationDigest"].sort().join("\0"))
        return false;
    try {
        const { kind: _kind, schemaVersion: _schema, verificationRef, verificationDigest, ...body } = p;
        return sha256Canonical(JSON.parse(output)) === p.rawResultDigest &&
            verificationDigest === sha256Canonical(body) &&
            verificationRef === `probabilistic-result-contract-preimage://abiogenesis/${verificationDigest.slice(7)}`;
    }
    catch {
        return false;
    }
}
export const WORKER_TRANSPORT_FAILURE_CLASS_VALUES = Object.freeze([
    "contract_failure",
    "no_output",
    "transport_failure",
]);
export function classifyWorkerTransportFailure(observation) {
    if (observation.nativeResultDisposition !== undefined) {
        // Preserve process/safety facts. Only the actual exact raw-contract owner
        // can make a complete artifact available despite a later ordinary exit.
        if (observation.lane === "closed_prompt_proof" && observation.toolCallCount > 0)
            return "contract_failure";
        if (observation.nativeResultDisposition === "admitted" && observation.terminationConfirmed &&
            !observation.processSpawnFailed && !observation.timedOut)
            return null;
        if (observation.nativeResultDisposition === "rejected")
            return "contract_failure";
    }
    if (observation.timedOut || !observation.terminationConfirmed ||
        observation.processSpawnFailed || observation.processStatus !== 0 ||
        observation.apiRetryCount > 0 ||
        (observation.parser === "claude_stream_json" &&
            observation.structuredEventCount === 0))
        return "transport_failure";
    if (observation.lane === "closed_prompt_proof" &&
        observation.toolCallCount > 0)
        return "contract_failure";
    return observation.finalOutput.trim().length === 0 ? "no_output" : null;
}
export const TRANSPORT_PROTOCOL_OWNED_FLAGS = deepFreeze({
    claude: [
        "-p",
        "--tools",
        "--safe-mode",
        "--output-format",
        "--include-partial-messages",
        "--permission-mode",
        "--json-schema",
    ],
    codex: ["exec", "--model", "--sandbox", "--full-auto", "-o"],
    gemini: ["-p"],
    generic: [],
});
function environmentValue(environment, key) {
    const value = environment[key];
    return value === undefined || value.length === 0 ? undefined : value;
}
export function transportAppendArgsEnvVar(agentKey) {
    return `ABG_TS_${agentKey.toUpperCase()}_APPEND_ARGS`;
}
export function admitWorkerSandboxDeclaration(environment = process.env) {
    const raw = environmentValue(environment, "ABG_TS_WORKER_SANDBOX");
    if (raw === undefined || raw === "agent_default")
        return "agent_default";
    if (raw === "external")
        return "external";
    throw new TypeError("ABG_TS_WORKER_SANDBOX must be 'agent_default' or 'external'");
}
function parseAppendArgs(environment, environmentKey) {
    const raw = environmentValue(environment, environmentKey);
    if (raw === undefined)
        return Object.freeze([]);
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch {
        throw new TypeError(`${environmentKey} must be a JSON array of strings`);
    }
    if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
        throw new TypeError(`${environmentKey} must be a JSON array of strings`);
    }
    return Object.freeze([...value]);
}
export function admitTransportAppendArgs(input) {
    const environment = input.environment ?? process.env;
    const environmentKey = transportAppendArgsEnvVar(input.agentKey);
    const args = [
        ...parseAppendArgs(environment, environmentKey),
        ...(input.explicitArgs ?? []),
    ];
    const protocolFlags = TRANSPORT_PROTOCOL_OWNED_FLAGS[input.agentKey];
    for (const arg of args) {
        if (arg.length === 0) {
            throw new TypeError(`${environmentKey} entries must be non-empty strings`);
        }
        if (arg.includes("{prompt}") || arg.includes("{output_path}")) {
            throw new TypeError(`${environmentKey} entries must not carry template placeholders`);
        }
        const flag = arg.split("=", 1)[0] ?? arg;
        if (protocolFlags.includes(flag)) {
            throw new TypeError(`${environmentKey} must not override protocol-owned flag ${flag}`);
        }
    }
    return Object.freeze(args);
}
export function withTransportAppendArgs(template, appendArgs) {
    if (appendArgs.length === 0)
        return Object.freeze([...template]);
    const placeholderIndex = template.findIndex((arg) => arg === "{prompt}" || arg === "{output_path}");
    const insertionIndex = placeholderIndex === -1
        ? template.length
        : placeholderIndex > 0 && template[placeholderIndex - 1]?.startsWith("-") === true
            ? placeholderIndex - 1
            : placeholderIndex;
    return Object.freeze([
        ...template.slice(0, insertionIndex),
        ...appendArgs,
        ...template.slice(insertionIndex),
    ]);
}
function contract(agentKey, command, prefixArgs, argsTemplate, parser, promptTransport, sanitizedEnvironmentPrefixes) {
    return deepFreeze({
        kind: "worker_transport_contract",
        schemaVersion: "5.0.0",
        agentKey,
        command,
        prefixArgs: [...prefixArgs],
        argsTemplate: [...argsTemplate],
        parser,
        promptTransport,
        sanitizedEnvironmentPrefixes: [...sanitizedEnvironmentPrefixes],
    });
}
export function constructKnownWorkerTransportContract(agentKey, options = {}) {
    const environment = options.environment ?? process.env;
    const prefixArgs = options.prefixArgs ?? [];
    switch (agentKey) {
        case "claude":
            return contract(agentKey, options.command ?? "claude", prefixArgs, [
                "-p",
                "--disable-slash-commands",
                "--no-session-persistence",
                "--output-format",
                "stream-json",
                "--include-partial-messages",
                "--verbose",
                "--permission-mode",
                "bypassPermissions",
            ], "claude_stream_json", "stdin", [
                "CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL",
                "CLAUDE_CODE_SSE_",
                "CLAUDE_CODE_ENTRYPOINT",
                "CLAUDE_CODE_EXECPATH",
            ]);
        case "codex": {
            const explicitSandbox = environmentValue(environment, "ABG_TS_CODEX_SANDBOX");
            const sandboxArgs = explicitSandbox !== undefined
                ? ["--sandbox", explicitSandbox]
                : admitWorkerSandboxDeclaration(environment) === "external"
                    ? ["--sandbox", "danger-full-access"]
                    : ["--full-auto"];
            return contract(agentKey, options.command ?? "codex", prefixArgs, [
                "exec",
                "--model",
                environmentValue(environment, "ABG_TS_CODEX_MODEL") ?? "gpt-5.5",
                ...sandboxArgs,
                "--skip-git-repo-check",
                "-o",
                "{output_path}",
                "{prompt}",
            ], "plain_text", "argv", []);
        }
        case "gemini":
            return contract(agentKey, options.command ?? "gemini", prefixArgs, ["-p", "{prompt}"], "plain_text", "argv", []);
        case "generic":
            return contract(agentKey, options.command ?? "fp-transport", prefixArgs, ["{prompt}"], "plain_text", "argv", []);
    }
}
export function composeWorkerTransportArgs(input) {
    const environment = input.environment ?? process.env;
    if (input.responsePresentation !== undefined && input.responsePresentation !== "result_text") {
        throw new TypeError("unsupported worker response presentation");
    }
    const appendArgs = admitTransportAppendArgs({
        agentKey: input.contract.agentKey,
        environment,
        ...(input.explicitAppendArgs === undefined
            ? {}
            : { explicitArgs: input.explicitAppendArgs }),
    });
    const template = [...input.contract.prefixArgs, ...input.contract.argsTemplate];
    let hasOpaqueSchemaArgument = false;
    if (input.contract.agentKey === "claude") {
        if (input.lane === "closed_prompt_proof") {
            template.push("--safe-mode", "--tools", "");
        }
        if (input.responseJsonSchema !== undefined && input.responsePresentation !== "result_text") {
            template.push("--json-schema", JSON.stringify(input.responseJsonSchema));
            hasOpaqueSchemaArgument = true;
        }
    }
    const args = withTransportAppendArgs(template, appendArgs);
    // Appended arguments cannot override this protocol-owned flag. Preserve its
    // literal schema while retaining all existing template/append positions.
    const schemaArgumentIndex = hasOpaqueSchemaArgument ? args.lastIndexOf("--json-schema") + 1 : -1;
    return args.map((arg, index) => index === schemaArgumentIndex ? arg : arg
        .replaceAll("{prompt}", input.prompt)
        .replaceAll("{output_path}", input.outputPath));
}
export function sanitizeWorkerTransportEnvironment(contract, source = process.env) {
    const environment = {};
    outer: for (const [key, value] of Object.entries(source)) {
        if (value === undefined)
            continue;
        for (const prefix of contract.sanitizedEnvironmentPrefixes) {
            if (key.startsWith(prefix))
                continue outer;
        }
        environment[key] = value;
    }
    if (contract.agentKey === "claude") {
        delete environment.CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL;
        environment.CLAUDE_CODE_DISABLE_ADVISOR_TOOL = "1";
    }
    return environment;
}
