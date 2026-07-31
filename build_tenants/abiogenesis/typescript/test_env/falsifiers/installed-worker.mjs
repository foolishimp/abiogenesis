import { constants } from "node:fs";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

async function readRequest() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function importInstalled(cliHost, specifier) {
  const parentUrl = pathToFileURL(
    join(cliHost, ".increment-0a-installed-worker.mjs"),
  ).href;
  const resolved = import.meta.resolve(specifier, parentUrl);
  const expectedRoot = "/node_modules/@abiogenesis/typescript-tenant/";
  if (!resolved.includes(expectedRoot)) {
    throw new TypeError(
      `${specifier} did not resolve through the installed Product: ${resolved}`,
    );
  }
  const target = new URL(resolved);
  target.searchParams.set("increment0aWorker", String(process.pid));
  return import(target.href);
}

function refusalCode(outcome) {
  if (typeof outcome?.code === "string") return outcome.code;
  if (typeof outcome?.result?.code === "string") return outcome.result.code;
  return null;
}

function summarizeOutcome(outcome) {
  return {
    disposition:
      typeof outcome?.disposition === "string" ? outcome.disposition : null,
    code: refusalCode(outcome),
    kind: typeof outcome?.kind === "string" ? outcome.kind : null,
    operationId:
      typeof outcome?.operationId === "string" ? outcome.operationId : null,
    invocationRef:
      typeof outcome?.invocationRef === "string" ? outcome.invocationRef : null,
  };
}

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function requireCondition(condition, message) {
  if (!condition) throw new TypeError(message);
}

function sameAuthority(left, right) {
  return left?.authorityDigest === right?.authorityDigest;
}

async function projectedAuthorityExtends(requested, projected) {
  if (
    requested?.eventLogPath !== projected?.eventLogPath ||
    requested?.device !== projected?.device ||
    requested?.inode !== projected?.inode ||
    requested?.eventContractDigest !== projected?.eventContractDigest ||
    !Number.isSafeInteger(requested?.durableByteLength) ||
    !Number.isSafeInteger(projected?.durableByteLength) ||
    projected.durableByteLength < requested.durableByteLength
  ) {
    return false;
  }
  const bytes = await readFile(projected.eventLogPath);
  return sha256Bytes(bytes.subarray(0, requested.durableByteLength)) ===
    requested.eventLogDigest;
}

function projectAndRemember(context) {
  if (context.pendingReopenAuthority !== null) {
    return context.pendingReopenAuthority;
  }
  if (context.store.configuredDurableLogPath() === null) return null;
  const authority = context.store.projectReopenAuthorityAndClose();
  context.pendingReopenAuthority = authority;
  return authority;
}

async function cloneVerifiedPrefix(cliHost, sourceAuthority, targetPath) {
  const abg = await importInstalled(
    cliHost,
    "@abiogenesis/typescript-tenant/abg",
  );
  const product = await importInstalled(
    cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const source = abg.reopenEventStore(sourceAuthority);
  requireCondition(
    source.kind === "reopened_event_store_context",
    `source prefix reopen refused: ${source.code ?? "unknown"}`,
  );
  source.store.closeDurableLog();
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(
    sourceAuthority.eventLogPath,
    targetPath,
    constants.COPYFILE_EXCL,
  );
  const [identity, bytes] = await Promise.all([
    stat(targetPath),
    readFile(targetPath),
  ]);
  requireCondition(
    sha256Bytes(bytes) === sourceAuthority.eventLogDigest,
    "cloned prefix bytes differ from the admitted source prefix",
  );
  const body = {
    kind: "event_store_reopen_authority",
    schemaVersion: "5.0.0",
    eventLogPath: targetPath,
    device: identity.dev,
    inode: identity.ino,
    eventLogDigest: sourceAuthority.eventLogDigest,
    durableByteLength: identity.size,
    eventContractDigest: sourceAuthority.eventContractDigest,
  };
  const candidate = {
    ...body,
    authorityDigest: product.sha256Canonical(body),
  };
  const reopened = abg.reopenEventStore(candidate);
  requireCondition(
    reopened.kind === "reopened_event_store_context",
    `cloned prefix reopen refused: ${reopened.code ?? "unknown"}`,
  );
  const authority = reopened.store.projectReopenAuthorityAndClose();
  requireCondition(
    authority.eventLogDigest === sourceAuthority.eventLogDigest &&
      authority.durableByteLength === sourceAuthority.durableByteLength,
    "cloned prefix does not preserve the exact durable prefix bytes",
  );
  return {
    authority,
    historicalEventCount: reopened.historicalEventCount,
  };
}

async function runF12Phase(context, publicApi, product, phase, requestedAuthority) {
  const ingressAuthority = context.pendingReopenAuthority;
  requireCondition(
    ingressAuthority !== null,
    `${phase.label}: retained context has no observable ingress prefix`,
  );
  const outcomes = [];
  for (const row of phase.rows) {
    outcomes.push(summarizeOutcome(
      await publicApi.applyRootPublicInvocation(context, row),
    ));
  }
  const projectedAuthority = projectAndRemember(context);
  requireCondition(
    projectedAuthority !== null,
    `${phase.label}: invocation did not project one durable prefix`,
  );
  return {
    label: phase.label,
    requestCarrierDigest: product.sha256Canonical(phase.rows),
    outcomes,
    requestedIngressEqual: sameAuthority(requestedAuthority, ingressAuthority),
    projectedExtendsRequested: await projectedAuthorityExtends(
      requestedAuthority,
      projectedAuthority,
    ),
    projectedAuthority,
  };
}

async function runF12Retained(request) {
  const publicApi = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/public",
  );
  const product = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const context = publicApi.createRootOperationContext();
  try {
    context.store.configureDurableLog(request.prefixA.eventLogPath);
    const setupOutcomes = [];
    for (const row of request.prefixA.setupRows) {
      setupOutcomes.push(summarizeOutcome(
        await publicApi.applyRootPublicInvocation(context, row),
      ));
    }
    const prefixA = projectAndRemember(context);
    requireCondition(prefixA !== null, "AX-F12 prefix A did not project");
    const freshA = await cloneVerifiedPrefix(
      request.cliHost,
      prefixA,
      request.prefixA.freshEventLogPath,
    );

    const phaseA = await runF12Phase(
      context,
      publicApi,
      product,
      request.phaseA,
      prefixA,
    );
    const phaseB = await runF12Phase(
      context,
      publicApi,
      product,
      request.phaseB,
      request.prefixB,
    );
    const phaseAReturn = await runF12Phase(
      context,
      publicApi,
      product,
      request.phaseAReturn,
      phaseA.projectedAuthority,
    );
    return {
      pid: process.pid,
      setupOutcomes,
      prefixA,
      freshA,
      phases: [phaseA, phaseB, phaseAReturn],
    };
  } finally {
    publicApi.closeRootOperationContext(context);
  }
}

async function runF12Fresh(request) {
  const publicApi = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/public",
  );
  const product = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const abg = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/abg",
  );
  const reopened = abg.reopenEventStore(request.authority);
  requireCondition(
    reopened.kind === "reopened_event_store_context",
    `fresh AX-F12 prefix reopen refused: ${reopened.code ?? "unknown"}`,
  );
  reopened.store.closeDurableLog();
  const context = publicApi.createRootOperationContext();
  context.pendingReopenAuthority = request.authority;
  try {
    return {
      pid: process.pid,
      phase: await runF12Phase(
      context,
      publicApi,
      product,
      request.phase,
      request.authority,
      ),
    };
  } finally {
    publicApi.closeRootOperationContext(context);
  }
}

async function inspectF12Prefix(request) {
  const abg = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/abg",
  );
  const reopened = abg.reopenEventStore(request.authority);
  requireCondition(
    reopened.kind === "reopened_event_store_context",
    `AX-F12 prefix inspection refused: ${reopened.code ?? "unknown"}`,
  );
  try {
    const events = reopened.store.readAll();
    const install = events.filter((event) =>
      event.kind === "public_operation_artifact_admitted" &&
      event.payload.operationId === "abg.operation.product.install" &&
      event.payload.invocationRef === request.installInvocationRef
    );
    const binding = events.filter((event) =>
      event.kind === "public_operation_artifact_admitted" &&
      event.payload.operationId === "abg.operation.workspace.bind" &&
      event.payload.invocationRef === request.bindingInvocationRef
    );
    return {
      authorityVerified: reopened.eventLogDigest === request.authority.eventLogDigest,
      historicalEventCount: reopened.historicalEventCount,
      installAdmissionCount: install.length,
      workspaceBindingAdmissionCount: binding.length,
    };
  } finally {
    reopened.store.closeDurableLog();
  }
}

async function runPublicTranscript(request) {
  const publicApi = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/public",
  );
  const product = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const abg = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/abg",
  );
  const context = publicApi.createRootOperationContext();
  let startHistoricalEventCount = null;
  let projectedAuthority = null;
  const phases = [];
  try {
    if (request.durableStart?.kind === "configure") {
      context.store.configureDurableLog(request.durableStart.eventLogPath);
      startHistoricalEventCount = 0;
    } else if (request.durableStart?.kind === "reopen") {
      const reopened = abg.reopenEventStore(request.durableStart.authority);
      if (reopened.kind !== "reopened_event_store_context") {
        throw new TypeError(
          `test prefix reopen refused: ${reopened.code}: ${reopened.message}`,
        );
      }
      context.store = reopened.store;
      context.pendingReopenAuthority = null;
      startHistoricalEventCount = reopened.historicalEventCount;
    }

    for (const phase of request.phases) {
      const outcomes = [];
      const outcomeProjectionDigests = [];
      for (const row of phase.rows) {
        const outcome = await publicApi.applyRootPublicInvocation(context, row);
        outcomeProjectionDigests.push(product.sha256Canonical(outcome));
        outcomes.push(
          request.fullOutcomes === true ? outcome : summarizeOutcome(outcome),
        );
      }
      phases.push({
        label: phase.label,
        requestCarrierDigest: product.sha256Canonical(phase.rows),
        outcomeProjectionDigests,
        outcomes,
      });
    }

    if (request.returnAuthority === true) {
      if (context.pendingReopenAuthority !== null) {
        projectedAuthority = context.pendingReopenAuthority;
      } else if (context.store.configuredDurableLogPath() !== null) {
        projectedAuthority = context.store.projectReopenAuthorityAndClose();
      }
    }
  } finally {
    publicApi.closeRootOperationContext(context);
  }
  return {
    phases,
    startHistoricalEventCount,
    authority: projectedAuthority,
  };
}

async function runOwnerVerify(request, resolveInProcess) {
  const product = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const verified = await product.verifyProduct({
    artifactPath: request.artifactPath,
    artifactRef: request.artifactRef,
    ...request.expectedIdentity,
  });
  const result = {
    verified,
    verifiedCanonicalDigest: product.sha256Canonical(verified),
  };
  if (resolveInProcess) {
    const lock = product.constructResolvedProductLock([verified]);
    return {
      ...result,
      lock,
      lockCanonicalDigest: product.sha256Canonical(lock),
    };
  }
  return result;
}

async function runOwnerResolve(request) {
  const product = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const inputCanonicalDigest = product.sha256Canonical(request.verified);
  const lock = product.constructResolvedProductLock([request.verified]);
  return {
    inputCanonicalDigest,
    lock,
    lockCanonicalDigest: product.sha256Canonical(lock),
  };
}

async function main() {
  const request = await readRequest();
  switch (request.action) {
    case "public_transcript":
      return runPublicTranscript(request);
    case "owner_verify":
      return runOwnerVerify(request, false);
    case "owner_verify_and_resolve":
      return runOwnerVerify(request, true);
    case "owner_resolve":
      return runOwnerResolve(request);
    case "f12_clone_prefix":
      return cloneVerifiedPrefix(
        request.cliHost,
        request.authority,
        request.targetPath,
      );
    case "f12_retained":
      return runF12Retained(request);
    case "f12_fresh":
      return runF12Fresh(request);
    case "f12_inspect_prefix":
      return inspectF12Prefix(request);
    default:
      throw new TypeError(`unknown installed-worker action ${request.action}`);
  }
}

try {
  const result = await main();
  process.stdout.write(`${JSON.stringify({ ok: true, result })}\n`);
} catch (error) {
  process.stdout.write(`${JSON.stringify({
    ok: false,
    error: {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    },
  })}\n`);
  process.exitCode = 1;
}
