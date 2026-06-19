import { readFileSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LIVE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(LIVE_DIR, "../..");
const POLICY_PATH = path.join(PACKAGE_ROOT, "config/operator-runtime-policy.json");

let cachedConfig = null;

function positiveIntegerFromRecord(record, key, label) {
  const value = record[key];
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${label}.${key}: expected positive integer`);
  }
  return value;
}

function positiveIntegerFromEnv(name) {
  const raw = process.env[name];
  if (raw === undefined) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function positiveInteger(envName, configuredValue) {
  return positiveIntegerFromEnv(envName) ?? configuredValue;
}

function timeoutMs(envName, configuredValue, minimumTimeoutMs) {
  return Math.max(minimumTimeoutMs, positiveInteger(envName, configuredValue));
}

function recordField(record, key, label) {
  const value = record[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label}.${key}: expected object`);
  }
  return value;
}

function stringFieldFromRecord(record, key, label) {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key}: expected non-empty string`);
  }
  return value;
}

function policyConfig() {
  if (cachedConfig !== null) {
    return cachedConfig;
  }
  const config = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
  if (config.kind !== "odd_sdlc_operator_runtime_policy") {
    throw new TypeError("operator-runtime-policy.json.kind: unexpected value");
  }
  if (config.policyRef !== "config://odd-sdlc/operator-runtime-policy/v1") {
    throw new TypeError("operator-runtime-policy.json.policyRef: unexpected value");
  }
  const worker = recordField(config, "worker", "operator-runtime-policy.json");
  const designDepthFpEvaluator = recordField(
    config,
    "designDepthFpEvaluator",
    "operator-runtime-policy.json"
  );
  const reviewGradeEdgeFulfillmentEvaluator = recordField(
    config,
    "reviewGradeEdgeFulfillmentEvaluator",
    "operator-runtime-policy.json"
  );
  const executionShard = recordField(
    config,
    "executionShard",
    "operator-runtime-policy.json"
  );
  const liveHarness = recordField(config, "liveHarness", "operator-runtime-policy.json");
  cachedConfig = Object.freeze({
    minimumOperatorTimeoutMs: positiveIntegerFromRecord(
      config,
      "minimumOperatorTimeoutMs",
      "operator-runtime-policy.json"
    ),
    workerTimeoutMs: positiveIntegerFromRecord(
      worker,
      "timeoutMs",
      "operator-runtime-policy.json.worker"
    ),
    workerInactivityTimeoutMs: positiveIntegerFromRecord(
      worker,
      "inactivityTimeoutMs",
      "operator-runtime-policy.json.worker"
    ),
    designDepthFpEvaluatorTimeoutMs: positiveIntegerFromRecord(
      designDepthFpEvaluator,
      "timeoutMs",
      "operator-runtime-policy.json.designDepthFpEvaluator"
    ),
    reviewGradeEdgeFulfillmentEvaluatorTimeoutMs: positiveIntegerFromRecord(
      reviewGradeEdgeFulfillmentEvaluator,
      "timeoutMs",
      "operator-runtime-policy.json.reviewGradeEdgeFulfillmentEvaluator"
    ),
    reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs:
      positiveIntegerFromRecord(
        reviewGradeEdgeFulfillmentEvaluator,
        "inactivityTimeoutMs",
        "operator-runtime-policy.json.reviewGradeEdgeFulfillmentEvaluator"
      ),
    reviewGradeEdgeFulfillmentEvaluatorStdoutBudgetBytes: positiveIntegerFromRecord(
      reviewGradeEdgeFulfillmentEvaluator,
      "stdoutBudgetBytes",
      "operator-runtime-policy.json.reviewGradeEdgeFulfillmentEvaluator"
    ),
    executionShardTimeoutMs: positiveIntegerFromRecord(
      executionShard,
      "timeoutMs",
      "operator-runtime-policy.json.executionShard"
    ),
    liveHarnessCommandTimeoutMs: positiveIntegerFromRecord(
      liveHarness,
      "commandTimeoutMs",
      "operator-runtime-policy.json.liveHarness"
    ),
    liveHarnessFullCapabilityCommandTimeoutMs: positiveIntegerFromRecord(
      liveHarness,
      "fullCapabilityCommandTimeoutMs",
      "operator-runtime-policy.json.liveHarness"
    ),
    liveHarnessLifecycleCommandTimeoutMs: positiveIntegerFromRecord(
      liveHarness,
      "lifecycleCommandTimeoutMs",
      "operator-runtime-policy.json.liveHarness"
    ),
    liveHarnessDataMapperWorkerTransport: stringFieldFromRecord(
      liveHarness,
      "dataMapperWorkerTransport",
      "operator-runtime-policy.json.liveHarness"
    )
  });
  return cachedConfig;
}

export function liveOperatorRuntimePolicy() {
  const config = policyConfig();
  const minimumOperatorTimeoutMs = positiveInteger(
    "ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS",
    config.minimumOperatorTimeoutMs
  );
  return Object.freeze({
    minimumOperatorTimeoutMs,
    workerTimeoutMs: timeoutMs(
      "ODD_SDLC_WORKER_TIMEOUT_MS",
      config.workerTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    workerInactivityTimeoutMs: timeoutMs(
      "ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS",
      config.workerInactivityTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    designDepthFpEvaluatorTimeoutMs: positiveInteger(
      "ODD_SDLC_DESIGN_DEPTH_FP_EVALUATOR_TIMEOUT_MS",
      config.designDepthFpEvaluatorTimeoutMs
    ),
    reviewGradeEdgeFulfillmentEvaluatorTimeoutMs: timeoutMs(
      "ODD_SDLC_REVIEW_GRADE_EDGE_FULFILLMENT_EVALUATOR_TIMEOUT_MS",
      config.reviewGradeEdgeFulfillmentEvaluatorTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs: positiveInteger(
      "ODD_SDLC_REVIEW_GRADE_EDGE_FULFILLMENT_EVALUATOR_INACTIVITY_TIMEOUT_MS",
      config.reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs
    ),
    reviewGradeEdgeFulfillmentEvaluatorStdoutBudgetBytes: positiveInteger(
      "ODD_SDLC_REVIEW_GRADE_EDGE_FULFILLMENT_EVALUATOR_STDOUT_BUDGET_BYTES",
      config.reviewGradeEdgeFulfillmentEvaluatorStdoutBudgetBytes
    ),
    executionShardTimeoutMs: timeoutMs(
      "ODD_SDLC_EXECUTION_SHARD_TIMEOUT_MS",
      config.executionShardTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    liveHarnessCommandTimeoutMs: timeoutMs(
      "ODD_SDLC_TS_LIVE_COMMAND_TIMEOUT_MS",
      config.liveHarnessCommandTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    liveHarnessFullCapabilityCommandTimeoutMs: timeoutMs(
      "ODD_SDLC_TS_LIVE_FULL_CAPABILITY_COMMAND_TIMEOUT_MS",
      config.liveHarnessFullCapabilityCommandTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    liveHarnessLifecycleCommandTimeoutMs: timeoutMs(
      "ODD_SDLC_TS_LIVE_LIFECYCLE_COMMAND_TIMEOUT_MS",
      config.liveHarnessLifecycleCommandTimeoutMs,
      minimumOperatorTimeoutMs
    ),
    liveHarnessDataMapperWorkerTransport:
      process.env["ODD_SDLC_TS_DATA_MAPPER_WORKER"] ??
      config.liveHarnessDataMapperWorkerTransport
  });
}

export function configuredLiveTimeoutMs(envName, configuredValue) {
  const policy = liveOperatorRuntimePolicy();
  return timeoutMs(envName, configuredValue, policy.minimumOperatorTimeoutMs);
}
