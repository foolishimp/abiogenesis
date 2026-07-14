import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(GATE_DIR, "../..");
const PROJECT_ROOT = path.resolve(TENANT_ROOT, "../../..");
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
  let activeKey = null;
  for (const line of header.split(/\r?\n/u)) {
    const field = /^- ([a-z_]+):(?:\s*(.*))?$/u.exec(line);
    if (field !== null) {
      activeKey = field[1];
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
  return values;
}

function value(fields, key) {
  return (fields.get(key) ?? []).join(" ").trim();
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
  for (const ticket of ticketFiles(ticketRoot)) {
    const source = readFileSync(ticket.filePath, "utf8");
    const fields = metadata(source);
    if (!/^DS-[123](?:\s|$)/u.test(value(fields, "delivery_phase"))) {
      continue;
    }
    checkedTickets += 1;
    const label = path.relative(projectRoot, ticket.filePath).split(path.sep).join("/");
    for (const field of REQUIRED_FIELDS) {
      if (value(fields, field) === "") {
        failures.push(`${label}: missing ${field}`);
      }
    }
    if (value(fields, "status") !== ticket.state) {
      failures.push(
        `${label}: status ${value(fields, "status") || "<missing>"} disagrees with ${ticket.state}/`
      );
    }
    const normalizedSource = source.replace(/\/\s+/gu, "/");
    const refs = new Set(
      [...normalizedSource.matchAll(
        /\.ai-workspace\/comments\/[A-Za-z0-9_.\/-]+\.md/gu
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
    checkedCommentRefs,
    requiredFields: REQUIRED_FIELDS.length,
    failures: Object.freeze(failures)
  });
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = inspectDsGovernance();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== "passed") {
    process.exitCode = 1;
  }
}
