declare const process: {
  readonly argv: readonly string[];
  readonly execPath: string;
  readonly pid: number;
  readonly stdout: { write(chunk: string): void };
  readonly stderr: { write(chunk: string): void };
  readonly env: Record<string, string | undefined>;
  exitCode: number | undefined;
  cwd(): string;
};

declare module "node:child_process" {
  export interface ChildProcessWithoutNullStreams {
    readonly pid?: number;
    readonly stdout: {
      on(event: "data", listener: (chunk: string) => void): void;
    };
    readonly stderr: {
      on(event: "data", listener: (chunk: string) => void): void;
    };
    readonly stdin: {
      write(data: string): void;
      end(): void;
    };
    once(event: "error", listener: (error: Error) => void): void;
    once(
      event: "close",
      listener: (code: number | null, signal: string | null) => void
    ): void;
    kill(signal: "SIGTERM" | "SIGKILL"): boolean;
  }
  export function spawn(
    command: string,
    args: readonly string[],
    options: {
      readonly cwd?: string;
      readonly env?: Record<string, string | undefined>;
      readonly stdio?: readonly ["pipe", "pipe", "pipe"];
    }
  ): ChildProcessWithoutNullStreams;
  export function spawnSync(
    command: string,
    args: readonly string[],
    options: {
      readonly cwd?: string;
      readonly encoding?: "utf8";
      readonly env?: Record<string, string | undefined>;
      readonly timeout?: number;
      readonly maxBuffer?: number;
    }
  ): {
    readonly status: number | null;
    readonly signal: string | null;
    readonly error?: Error;
    readonly stdout: string;
    readonly stderr: string;
  };
}

declare module "node:fs" {
  interface Stats {
    isDirectory(): boolean;
    isFile(): boolean;
    isSymbolicLink(): boolean;
  }
  export function appendFileSync(
    path: string,
    data: string,
    encoding: "utf8"
  ): void;
  export function mkdirSync(
    path: string,
    options: { readonly recursive: true }
  ): string | undefined;
  export function mkdirSync(path: string): string | undefined;
  export function existsSync(path: string): boolean;
  export function lstatSync(path: string): Stats;
  export function lstatSync(
    path: string,
    options: { readonly throwIfNoEntry: false }
  ): Stats | undefined;
  export function statSync(path: string): Stats;
  export function realpathSync(path: string): string;
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string): Uint8Array;
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function rmSync(
    path: string,
    options: { readonly recursive: true; readonly force: true }
  ): void;
  export function writeFileSync(
    path: string,
    data: string,
    encoding: "utf8"
  ): void;
  export function writeFileSync(
    path: string,
    data: string,
    options: { readonly encoding: "utf8"; readonly flag: "wx" }
  ): void;
}

declare module "node:perf_hooks" {
  export const performance: {
    now(): number;
  };
}

declare module "node:crypto" {
  export function randomUUID(): string;
  export function createHash(algorithm: string): {
    update(data: string | Uint8Array): {
      digest(encoding: "hex"): string;
    };
  };
}

declare module "node:fs/promises" {
  export function access(path: string): Promise<void>;
  export function readFile(path: string): Promise<Uint8Array>;
  export function readFile(path: string, encoding: "utf8"): Promise<string>;
  export function writeFile(
    path: string,
    data: string,
    encoding: "utf8"
  ): Promise<void>;
  // T-217 S2.2 (D1.4): the kernel copy-out instrument preserves divergent
  // evidence BYTES verbatim — no encoding round-trip.
  export function writeFile(path: string, data: Uint8Array): Promise<void>;
  export function appendFile(
    path: string,
    data: string,
    encoding: "utf8"
  ): Promise<void>;
  export function mkdir(
    path: string,
    options: { readonly recursive: true }
  ): Promise<string | undefined>;
  export function mkdtemp(prefix: string): Promise<string>;
  export function rm(
    path: string,
    options: { readonly recursive?: boolean; readonly force?: boolean }
  ): Promise<void>;
  export function cp(
    source: string,
    destination: string,
    options: { readonly recursive?: boolean }
  ): Promise<void>;
  export function readdir(
    path: string,
    options: { readonly withFileTypes: true }
  ): Promise<
    readonly {
      readonly name: string;
      isDirectory(): boolean;
      isFile(): boolean;
    }[]
  >;
  export function symlink(
    target: string,
    path: string,
    type?: "dir" | "file"
  ): Promise<void>;
  export function chmod(path: string, mode: number): Promise<void>;
  export function stat(path: string): Promise<{
    isDirectory(): boolean;
    isFile(): boolean;
  }>;
}

declare module "node:path" {
  export function dirname(path: string): string;
  export function isAbsolute(path: string): boolean;
  export function join(...paths: readonly string[]): string;
  export function relative(from: string, to: string): string;
  export function resolve(...paths: readonly string[]): string;
  // codex P1 (review 2026-07-10): the measured-path containment law
  // compares against the platform separator
  export const sep: string;
}

declare module "node:url" {
  export function fileURLToPath(url: string): string;
  export function pathToFileURL(path: string): { readonly href: string };
}
