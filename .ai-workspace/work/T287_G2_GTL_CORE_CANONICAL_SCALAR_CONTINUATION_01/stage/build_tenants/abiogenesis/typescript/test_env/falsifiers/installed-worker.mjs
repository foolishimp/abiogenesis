import { join } from "node:path";
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

async function runF12ContextSequence(request) {
  const publicApi = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/public",
  );
  const product = await importInstalled(
    request.cliHost,
    "@abiogenesis/typescript-tenant/product",
  );
  const episodes = [];
  for (const episode of request.episodes) {
    const context = publicApi.reopenRootOperationContext(episode.handoff);
    const startHistoricalEventCount = context.store.readAll().length;
    const ingressPrefix = structuredClone(context.prefix);
    const outcomes = [];
    const outcomeProjectionDigests = [];
    let endEventCount = startHistoricalEventCount;
    let successorHandoff = null;
    try {
      for (const row of episode.rows) {
        const outcome = await publicApi.applyRootPublicInvocation(context, row);
        outcomes.push(summarizeOutcome(outcome));
        outcomeProjectionDigests.push(product.sha256Canonical(outcome));
      }
      endEventCount = context.store.readAll().length;
      successorHandoff = publicApi.projectRootOperationContextAuthority(context);
    } finally {
      publicApi.closeRootOperationContext(context);
    }
    episodes.push({
      label: episode.label,
      requestCarrierDigest: product.sha256Canonical(episode.rows),
      ingressPrefix,
      startHistoricalEventCount,
      endEventCount,
      outcomeProjectionDigests,
      outcomes,
      successorHandoff,
    });
  }
  return { pid: process.pid, episodes };
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
  const context = request.durableStart?.kind === "reopen"
    ? publicApi.reopenRootOperationContext(request.durableStart.handoff)
    : publicApi.createRootOperationContext(request.durableStart.eventLogPath);
  const startHistoricalEventCount = context.store.readAll().length;
  let endEventCount = startHistoricalEventCount;
  let handoff = null;
  const phases = [];
  try {
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
    endEventCount = context.store.readAll().length;
    if (
      request.returnHandoff === true &&
      context.store.configuredDurableLogPath() !== null
    ) {
      handoff = publicApi.projectRootOperationContextAuthority(context);
    }
  } finally {
    publicApi.closeRootOperationContext(context);
  }
  return {
    pid: process.pid,
    phases,
    startHistoricalEventCount,
    endEventCount,
    handoff,
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
    case "f12_context_sequence":
      return runF12ContextSequence(request);
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
