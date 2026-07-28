#!/usr/bin/env node

import { spawn } from "node:child_process";
import { realpathSync, statSync } from "node:fs";
import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

function usage(message: string): never {
  process.stderr.write(
    `${message}\nusage: abg.codex --cli <installed-abg.cli> --jsonl <transcript>\n`,
  );
  process.exit(2);
}

function exactArguments(argv: readonly string[]): {
  readonly cliPath: string;
  readonly transcriptPath: string;
} {
  if (
    argv.length !== 4 ||
    argv[0] !== "--cli" ||
    argv[2] !== "--jsonl"
  ) {
    return usage("abg.codex requires one exact CLI and transcript");
  }
  const cliPath = argv[1];
  const transcriptPath = argv[3];
  let resolvedCliPath: string;
  let resolvedTranscriptPath: string;
  let installedCliPath: string;
  try {
    resolvedCliPath = realpathSync(cliPath ?? "");
    resolvedTranscriptPath = realpathSync(transcriptPath ?? "");
    installedCliPath = realpathSync(
      fileURLToPath(new URL("./cli.js", import.meta.url)),
    );
  } catch {
    return usage("abg.codex paths must identify exact absolute files");
  }
  if (
    cliPath === undefined ||
    transcriptPath === undefined ||
    !isAbsolute(cliPath) ||
    !isAbsolute(transcriptPath) ||
    resolvedCliPath !== installedCliPath ||
    !statSync(resolvedCliPath).isFile() ||
    !statSync(resolvedTranscriptPath).isFile()
  ) {
    return usage(
      "abg.codex requires the exact sibling installed abg.cli and one transcript",
    );
  }
  return { cliPath, transcriptPath };
}

const { cliPath, transcriptPath } = exactArguments(process.argv.slice(2));
const child = spawn(cliPath, ["--jsonl", transcriptPath], {
  stdio: "inherit",
  shell: false,
});

child.once("error", (error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
