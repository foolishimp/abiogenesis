import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { performance } from "node:perf_hooks";
import type { ActorInvocation, RuntimeEvent } from "../contracts/carriers.js";
import {
  constructActorProcessExitedEvent,
  constructActorProcessHeartbeatEvent,
  constructActorProcessSignalSentEvent,
  constructActorProcessStartedEvent,
  constructActorProcessStreamObservedEvent,
  constructActorProcessTimeoutEvent
} from "../contracts/event_factories.js";
import { emit, type RuntimeEventSink } from "../events/index.js";

export interface SupervisedProcessEnvironmentPolicy {
  readonly prefixes: readonly string[];
}

export interface SupervisedProcessActorRequest {
  readonly invocation: ActorInvocation;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly environmentPolicy?: SupervisedProcessEnvironmentPolicy | undefined;
  readonly stdin?: string | null | undefined;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly stdoutRef: string;
  readonly stderrRef: string;
  readonly processStartedPath?: string | undefined;
  readonly processEventsPath?: string | undefined;
  readonly timeoutMs?: number | undefined;
  readonly terminationGraceMs?: number | undefined;
  readonly heartbeatMs?: number | undefined;
  readonly eventSink?: RuntimeEventSink | undefined;
}

export interface SupervisedProcessActorResult {
  readonly kind: "supervised_process_actor_result";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly pid: number | null;
  readonly status: number | null;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly timedOut: boolean;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly error: string | null;
  readonly events: readonly RuntimeEvent[];
}

const DEFAULT_TIMEOUT_MS = 1000 * 60 * 30;
const DEFAULT_TERMINATION_GRACE_MS = 1000 * 10;
const DEFAULT_HEARTBEAT_MS = 1000 * 30;

function roundElapsedMs(startedAt: number): number {
  return Math.max(0, Math.round(performance.now() - startedAt));
}

function sanitizedEnvironment(input: {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly policy: SupervisedProcessEnvironmentPolicy | undefined;
}): Readonly<Record<string, string>> {
  const prefixes = input.policy?.prefixes ?? Object.freeze([]);
  const sanitized: Record<string, string> = {};
  outer: for (const [key, value] of Object.entries(input.environment)) {
    if (value === undefined) {
      continue;
    }
    for (const prefix of prefixes) {
      if (prefix.length > 0 && key.startsWith(prefix)) {
        continue outer;
      }
    }
    sanitized[key] = value;
  }
  return Object.freeze(sanitized);
}

function appendJsonLine(path: string | undefined, payload: RuntimeEvent): void {
  if (path === undefined) {
    return;
  }
  appendFileSync(path, `${JSON.stringify(payload)}\n`, "utf8");
}

function writeJson(path: string | undefined, payload: unknown): void {
  if (path === undefined) {
    return;
  }
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function normalizeExitStatus(status: number | null): number | null {
  if (status === null) {
    return null;
  }
  if (status < 0) {
    return null;
  }
  return status;
}

function errorStringField(error: Error, key: string): string | null {
  const value: unknown = Reflect.get(error, key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function errorNumberField(error: Error, key: string): number | null {
  const value: unknown = Reflect.get(error, key);
  return typeof value === "number" ? value : null;
}

function spawnErrorMessage(error: Error): string {
  const code = errorStringField(error, "code");
  const errno = errorNumberField(error, "errno");
  const syscall = errorStringField(error, "syscall");
  const path = errorStringField(error, "path");
  const details = [
    code === null ? null : `code=${code}`,
    errno === null ? null : `errno=${String(errno)}`,
    syscall === null ? null : `syscall=${syscall}`,
    path === null ? null : `path=${path}`,
    error.message
  ].filter((entry): entry is string => entry !== null && entry.length > 0);
  return details.join(" ");
}

export async function invokeSupervisedProcessActor(
  request: SupervisedProcessActorRequest
): Promise<SupervisedProcessActorResult> {
  mkdirSync(dirname(request.stdoutPath), { recursive: true });
  mkdirSync(dirname(request.stderrPath), { recursive: true });
  writeFileSync(request.stdoutPath, "", "utf8");
  writeFileSync(request.stderrPath, "", "utf8");
  if (request.processEventsPath !== undefined) {
    mkdirSync(dirname(request.processEventsPath), { recursive: true });
    writeFileSync(request.processEventsPath, "", "utf8");
  }

  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const terminationGraceMs =
    request.terminationGraceMs ?? DEFAULT_TERMINATION_GRACE_MS;
  const heartbeatMs = request.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
  const startedAt = performance.now();
  const events: RuntimeEvent[] = [];
  const eventSink: RuntimeEventSink = (event) => {
    appendJsonLine(request.processEventsPath, event);
    events.push(event);
    request.eventSink?.(event);
  };

  const child = spawn(request.command, [...request.args], {
    cwd: request.cwd,
    env: sanitizedEnvironment({
      environment: request.environment,
      policy: request.environmentPolicy
    }),
    stdio: ["pipe", "pipe", "pipe"]
  });
  const pid = child.pid ?? null;
  let timedOut = false;
  let errorMessage: string | null = null;
  let stdoutChunkIndex = 0;
  let stderrChunkIndex = 0;
  let heartbeatIndex = 0;
  let closed = false;

  const startedEvent = constructActorProcessStartedEvent({
    invocation: request.invocation,
    command: request.command,
    args: request.args,
    cwd: request.cwd,
    pid,
    timeoutMs,
    stdoutRef: request.stdoutRef,
    stderrRef: request.stderrRef
  });
  writeJson(request.processStartedPath, startedEvent);
  emit(startedEvent, eventSink);

  child.stdout?.on("data", (chunk: string) => {
    appendFileSync(request.stdoutPath, chunk, "utf8");
    emit(
      constructActorProcessStreamObservedEvent({
        invocation: request.invocation,
        streamName: "stdout",
        streamRef: request.stdoutRef,
        chunkIndex: stdoutChunkIndex,
        byteLength: chunk.length
      }),
      eventSink
    );
    stdoutChunkIndex += 1;
  });

  child.stderr?.on("data", (chunk: string) => {
    appendFileSync(request.stderrPath, chunk, "utf8");
    emit(
      constructActorProcessStreamObservedEvent({
        invocation: request.invocation,
        streamName: "stderr",
        streamRef: request.stderrRef,
        chunkIndex: stderrChunkIndex,
        byteLength: chunk.length
      }),
      eventSink
    );
    stderrChunkIndex += 1;
  });

  child.once("error", (error) => {
    errorMessage = spawnErrorMessage(error);
  });

  if (request.stdin !== null && request.stdin !== undefined) {
    child.stdin?.write(request.stdin);
  }
  child.stdin?.end();

  return await new Promise((resolve) => {
    const heartbeatTimer =
      heartbeatMs > 0
        ? setInterval(() => {
            if (closed) {
              return;
            }
            emit(
              constructActorProcessHeartbeatEvent({
                invocation: request.invocation,
                heartbeatIndex,
                elapsedMs: roundElapsedMs(startedAt)
              }),
              eventSink
            );
            heartbeatIndex += 1;
          }, heartbeatMs)
        : null;

    let killTimer: ReturnType<typeof setTimeout> | null = null;
    const timeoutTimer =
      timeoutMs > 0
        ? setTimeout(() => {
            if (closed) {
              return;
            }
            timedOut = true;
            emit(
              constructActorProcessTimeoutEvent({
                invocation: request.invocation,
                timeoutMs,
                elapsedMs: roundElapsedMs(startedAt)
              }),
              eventSink
            );
            child.kill("SIGTERM");
            emit(
              constructActorProcessSignalSentEvent({
                invocation: request.invocation,
                signal: "SIGTERM",
                elapsedMs: roundElapsedMs(startedAt)
              }),
              eventSink
            );
            killTimer = setTimeout(() => {
              if (closed) {
                return;
              }
              child.kill("SIGKILL");
              emit(
                constructActorProcessSignalSentEvent({
                  invocation: request.invocation,
                  signal: "SIGKILL",
                  elapsedMs: roundElapsedMs(startedAt)
                }),
                eventSink
              );
            }, terminationGraceMs);
          }, timeoutMs)
        : null;

    child.once("close", (status, signal) => {
      closed = true;
      if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
      }
      if (timeoutTimer !== null) {
        clearTimeout(timeoutTimer);
      }
      if (killTimer !== null) {
        clearTimeout(killTimer);
      }
      const elapsedMs = roundElapsedMs(startedAt);
      const normalizedStatus = normalizeExitStatus(status);
      emit(
        constructActorProcessExitedEvent({
          invocation: request.invocation,
          status: normalizedStatus,
          signal,
          elapsedMs,
          timedOut,
          error: errorMessage
        }),
        eventSink
      );
      resolve(
        Object.freeze({
          kind: "supervised_process_actor_result",
          command: request.command,
          args: Object.freeze([...request.args]),
          cwd: request.cwd,
          pid,
          status: normalizedStatus,
          signal,
          elapsedMs,
          timedOut,
          stdoutPath: request.stdoutPath,
          stderrPath: request.stderrPath,
          error: errorMessage,
          events: Object.freeze([...events])
        })
      );
    });
  });
}
