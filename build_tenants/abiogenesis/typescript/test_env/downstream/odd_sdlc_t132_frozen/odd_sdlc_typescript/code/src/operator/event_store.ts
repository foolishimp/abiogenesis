// Implements: REQ-F-ODDSDLC-055

import {
  assertRuntimeEvent,
  emit,
  type RuntimeEvent
} from "@abiogenesis/typescript-tenant";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function oddSdlcRuntimeEventsPath(workspaceRoot: string): string {
  return join(workspaceRoot, ".ai-workspace", "events", "events.jsonl");
}

function parseRuntimeEventsText(
  text: string,
  label: string
): readonly RuntimeEvent[] {
  const events: RuntimeEvent[] = [];
  const lines = text.split(/\r?\n/u);
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      assertRuntimeEvent(parsed);
      events.push(parsed);
    } catch {
      throw new TypeError(`${label} line ${index + 1} is not valid JSON`);
    }
  }
  return Object.freeze(events);
}

export function readOddSdlcRuntimeEventsSync(
  workspaceRoot: string
): readonly RuntimeEvent[] {
  const eventLogPath = oddSdlcRuntimeEventsPath(workspaceRoot);
  if (!existsSync(eventLogPath)) {
    return Object.freeze([]);
  }
  return parseRuntimeEventsText(readFileSync(eventLogPath, "utf8"), eventLogPath);
}

export async function readOddSdlcRuntimeEvents(
  workspaceRoot: string
): Promise<readonly RuntimeEvent[]> {
  const eventLogPath = oddSdlcRuntimeEventsPath(workspaceRoot);
  if (!existsSync(eventLogPath)) {
    return Object.freeze([]);
  }
  return parseRuntimeEventsText(await readFile(eventLogPath, "utf8"), eventLogPath);
}

export async function appendOddSdlcRuntimeEvents(input: {
  readonly workspaceRoot: string;
  readonly events: readonly RuntimeEvent[];
}): Promise<string> {
  const eventLogPath = oddSdlcRuntimeEventsPath(input.workspaceRoot);
  const emitted: RuntimeEvent[] = [];
  emit(input.events, (event) => {
    emitted.push(event);
  });
  if (emitted.length === 0) {
    return eventLogPath;
  }
  await mkdir(dirname(eventLogPath), { recursive: true });
  await appendFile(
    eventLogPath,
    `${emitted.map((event) => JSON.stringify(event)).join("\n")}\n`,
    "utf8"
  );
  return eventLogPath;
}
