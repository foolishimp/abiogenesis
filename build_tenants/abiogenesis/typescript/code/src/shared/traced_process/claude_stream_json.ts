export interface ClaudeStreamJsonState {
  lineBuffer: string;
  structuredEventCount: number;
  structuredParseFailureCount: number;
  finalResultText: string | null;
  readonly assistantTextChunks: string[];
  readonly apiRetryEvents: unknown[];
  readonly toolCallEvents: unknown[];
}

export type ClaudeStreamJsonObservation =
  | {
      readonly kind: "structured_event_observed";
      readonly event: Record<string, unknown>;
    }
  | {
      readonly kind: "api_retry_observed";
      readonly event: Record<string, unknown>;
    }
  | {
      readonly kind: "tool_call_observed";
      readonly event: unknown;
    }
  | {
      readonly kind: "structured_event_parse_failed";
      readonly line: string;
    };

export function createClaudeStreamJsonState(): ClaudeStreamJsonState {
  return {
    lineBuffer: "",
    structuredEventCount: 0,
    structuredParseFailureCount: 0,
    finalResultText: null,
    assistantTextChunks: [],
    apiRetryEvents: [],
    toolCallEvents: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function claudeMessageText(event: Record<string, unknown>): string[] {
  const message = event["message"];
  if (!isRecord(message)) {
    return [];
  }
  const content = message["content"];
  if (!Array.isArray(content)) {
    return [];
  }
  const out: string[] = [];
  for (const item of content) {
    if (!isRecord(item)) {
      continue;
    }
    if (item["type"] === "text" && typeof item["text"] === "string") {
      out.push(item["text"]);
    }
  }
  return out;
}

function claudeToolUseEvents(event: Record<string, unknown>): readonly unknown[] {
  const message = event["message"];
  if (!isRecord(message)) {
    return [];
  }
  const content = message["content"];
  if (!Array.isArray(content)) {
    return [];
  }
  return content.filter(
    (item): item is Record<string, unknown> =>
      isRecord(item) && item["type"] === "tool_use"
  );
}

function withoutAnsiControl(text: string): string {
  return text.replace(/\u001B(?:\[[0-?]*[ -/]*[@-~]|\][^\u0007]*(?:\u0007|\u001B\\)|[PX^_][\s\S]*?\u001B\\|[@-Z\\-_])/gu, "");
}

function isTerminalControlOnly(text: string): boolean {
  const withoutAnsi = withoutAnsiControl(text)
    .replace(/[\u0000-\u001F\u007F]/gu, "")
    .trim();
  return withoutAnsi.length === 0;
}

function observeStructuredEvent(
  state: ClaudeStreamJsonState,
  event: Record<string, unknown>
): readonly ClaudeStreamJsonObservation[] {
  const observations: ClaudeStreamJsonObservation[] = [
    { kind: "structured_event_observed", event }
  ];
  state.structuredEventCount += 1;

  if (event["type"] === "system" && event["subtype"] === "api_retry") {
    state.apiRetryEvents.push(event);
    observations.push({ kind: "api_retry_observed", event });
  }

  for (const toolUse of claudeToolUseEvents(event)) {
    state.toolCallEvents.push(toolUse);
    observations.push({ kind: "tool_call_observed", event: toolUse });
  }

  if (event["type"] === "assistant") {
    state.assistantTextChunks.push(...claudeMessageText(event));
  }

  if (event["type"] === "result") {
    const resultText = stringField(event, "result");
    if (
      resultText !== null &&
      (state.finalResultText === null || event["subtype"] === "success")
    ) {
      state.finalResultText = resultText;
    }
  }

  return observations;
}

function observeLine(
  state: ClaudeStreamJsonState,
  line: string
): readonly ClaudeStreamJsonObservation[] {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return [];
  }
  if (isTerminalControlOnly(trimmed)) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (isRecord(parsed)) {
      return observeStructuredEvent(state, parsed);
    }
  } catch {
    state.structuredParseFailureCount += 1;
    return [{ kind: "structured_event_parse_failed", line: trimmed }];
  }
  return [];
}

export function observeClaudeStreamJsonChunk(
  state: ClaudeStreamJsonState,
  chunk: string
): readonly ClaudeStreamJsonObservation[] {
  const observations: ClaudeStreamJsonObservation[] = [];
  state.lineBuffer += chunk;
  const lines = state.lineBuffer.split("\n");
  state.lineBuffer = lines.pop() ?? "";
  for (const line of lines) {
    observations.push(...observeLine(state, line));
  }
  return observations;
}

export function flushClaudeStreamJson(
  state: ClaudeStreamJsonState
): readonly ClaudeStreamJsonObservation[] {
  const line = state.lineBuffer;
  state.lineBuffer = "";
  return observeLine(state, line);
}

export function finalOutputFromClaudeStreamJsonState(
  state: ClaudeStreamJsonState
): string {
  if (state.finalResultText !== null && state.finalResultText.length > 0) {
    return state.finalResultText;
  }
  return state.assistantTextChunks.join("");
}
