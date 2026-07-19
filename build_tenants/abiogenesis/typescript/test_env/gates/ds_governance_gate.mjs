import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(GATE_DIR, "../..");
const PROJECT_ROOT = path.resolve(TENANT_ROOT, "../../..");
const DELIVERY_ROOT_TICKET_IDS = Object.freeze(["T-276"]);
const DELIVERY_ROOT_TEST = path.join(
  "test_env",
  "tests",
  "test_t276_installed_consensus_steel_thread.test.mjs"
);
const DELIVERY_ROOT_STEPS = Object.freeze([
  Object.freeze({ command: "npm", args: Object.freeze(["run", "build:host"]) }),
  Object.freeze({
    command: process.execPath,
    args: Object.freeze([
      "--test",
      "--test-concurrency=1",
      DELIVERY_ROOT_TEST
    ])
  })
]);
const REQUIRED_FIELDS = Object.freeze([
  "id",
  "title",
  "type",
  "ticket_category",
  "status",
  "goal",
  "delivery_phase",
  "change_intent",
  "change_class",
  "re_entry_point",
  "triaged_at",
  "created_at",
  "updated_at"
]);

function metadata(source) {
  const firstHeading = source.search(/^##\s/mu);
  const header = firstHeading === -1 ? source : source.slice(0, firstHeading);
  const values = new Map();
  const duplicateKeys = new Set();
  let activeKey = null;
  for (const line of header.split(/\r?\n/u)) {
    const field = /^- ([a-z_]+):(?:\s*(.*))?$/u.exec(line);
    if (field !== null) {
      activeKey = field[1];
      if (values.has(activeKey)) {
        duplicateKeys.add(activeKey);
      }
      const inline = field[2]?.trim() ?? "";
      values.set(activeKey, inline === "|-" || inline === ">-" ? [] : [inline]);
      continue;
    }
    if (activeKey !== null && /^ {2,}/u.test(line)) {
      const value = line.trim().replace(/^-\s+/u, "");
      if (value !== "") {
        values.get(activeKey)?.push(value);
      }
      continue;
    }
    activeKey = null;
  }
  return Object.freeze({ values, duplicateKeys: Object.freeze([...duplicateKeys].sort()) });
}

function value(fields, key) {
  return (fields.values.get(key) ?? []).join(" ").trim();
}

function ticketFiles(ticketRoot) {
  return ["active", "completed"].flatMap((state) => {
    const stateRoot = path.join(ticketRoot, state);
    if (!existsSync(stateRoot)) {
      return [];
    }
    return readdirSync(stateRoot)
      .filter((name) => /^T-\d+-.+\.md$/u.test(name))
      .sort()
      .map((name) => ({ state, filePath: path.join(stateRoot, name) }));
  });
}

export function inspectDsGovernance({
  projectRoot = PROJECT_ROOT,
  ticketRoot = path.join(projectRoot, ".ai-workspace", "tickets")
} = {}) {
  const failures = [];
  let checkedTickets = 0;
  let checkedCommentRefs = 0;
  const inventory = ticketFiles(ticketRoot).map((ticket) => {
    const source = readFileSync(ticket.filePath, "utf8");
    const fields = metadata(source);
    return Object.freeze({ ...ticket, source, fields, id: value(fields, "id") });
  });
  const deliveryIds = new Set(DELIVERY_ROOT_TICKET_IDS);
  let changed = true;
  while (changed) {
    changed = false;
    for (const ticket of inventory) {
      if (
        !deliveryIds.has(ticket.id) &&
        deliveryIds.has(value(ticket.fields, "source_ticket"))
      ) {
        deliveryIds.add(ticket.id);
        changed = true;
      }
    }
  }

  for (const ticket of inventory) {
    if (!deliveryIds.has(ticket.id)) {
      continue;
    }
    checkedTickets += 1;
    const label = path.relative(projectRoot, ticket.filePath).split(path.sep).join("/");
    for (const duplicateKey of ticket.fields.duplicateKeys) {
      failures.push(`${label}: duplicate ${duplicateKey}`);
    }
    for (const field of REQUIRED_FIELDS) {
      if (value(ticket.fields, field) === "") {
        failures.push(`${label}: missing ${field}`);
      }
    }
    if (value(ticket.fields, "status") !== ticket.state) {
      failures.push(
        `${label}: status ${value(ticket.fields, "status") || "<missing>"} disagrees with ${ticket.state}/`
      );
    }
    const normalizedSource = ticket.source.replace(/\/\s+/gu, "/");
    const refs = new Set(
      [...normalizedSource.matchAll(
        /\.ai-workspace\/comments\/[A-Za-z0-9_./-]+\.md/gu
      )].map((match) => match[0])
    );
    for (const ref of refs) {
      checkedCommentRefs += 1;
      if (!existsSync(path.join(projectRoot, ref))) {
        failures.push(`${label}: missing commentary reference ${ref}`);
      }
    }
  }
  return Object.freeze({
    status: failures.length === 0 ? "passed" : "failed",
    checkedTickets,
    deliveryRootTicketIds: DELIVERY_ROOT_TICKET_IDS,
    checkedCommentRefs,
    requiredFields: REQUIRED_FIELDS.length,
    failures: Object.freeze(failures)
  });
}

export function executeDeliveryRootOutcome({
  tenantRoot = TENANT_ROOT,
  spawn = spawnSync
} = {}) {
  const steps = [];
  for (const step of DELIVERY_ROOT_STEPS) {
    const outcome = spawn(step.command, [...step.args], {
      cwd: tenantRoot,
      encoding: "utf8",
      env: process.env,
      maxBuffer: 32 * 1024 * 1024
    });
    const stepResult = Object.freeze({
      command: Object.freeze([step.command, ...step.args]),
      status: outcome.status === 0 ? "passed" : "failed",
      exitCode: outcome.status,
      signal: outcome.signal ?? null,
      stdout: outcome.stdout ?? "",
      stderr: outcome.stderr ?? "",
      error: outcome.error?.message ?? null
    });
    steps.push(stepResult);
    if (stepResult.status === "failed") {
      break;
    }
  }
  return Object.freeze({
    status:
      steps.length === DELIVERY_ROOT_STEPS.length &&
      steps.every((step) => step.status === "passed")
        ? "passed"
        : "failed",
    deliveryRootTicketId: DELIVERY_ROOT_TICKET_IDS[0],
    packedTest: DELIVERY_ROOT_TEST,
    steps: Object.freeze(steps)
  });
}

export function evaluateDsGovernance(inspection, rootOutcome) {
  return Object.freeze({
    status:
      inspection.status === "passed" && rootOutcome.status === "passed"
        ? "passed"
        : "failed",
    inspection,
    rootOutcome
  });
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const inspection = inspectDsGovernance();
  const rootOutcome =
    inspection.status === "passed"
      ? executeDeliveryRootOutcome()
      : Object.freeze({
          status: "blocked",
          deliveryRootTicketId: DELIVERY_ROOT_TICKET_IDS[0],
          packedTest: DELIVERY_ROOT_TEST,
          steps: Object.freeze([])
        });
  const result = evaluateDsGovernance(inspection, rootOutcome);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== "passed") {
    process.exitCode = 1;
  }
}
