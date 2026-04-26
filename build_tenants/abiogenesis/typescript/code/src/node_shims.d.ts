declare const process: {
  readonly argv: readonly string[];
  readonly stdout: { write(chunk: string): void };
  readonly stderr: { write(chunk: string): void };
  readonly env: Record<string, string | undefined>;
  exitCode: number | undefined;
  cwd(): string;
};

declare module "node:child_process" {
  export function spawnSync(
    command: string,
    args: readonly string[],
    options: {
      readonly cwd?: string;
      readonly encoding?: "utf8";
      readonly env?: Record<string, string | undefined>;
    }
  ): {
    readonly status: number | null;
    readonly stdout: string;
    readonly stderr: string;
  };
}

declare module "node:fs/promises" {
  export function access(path: string): Promise<void>;
  export function readFile(path: string, encoding: "utf8"): Promise<string>;
  export function writeFile(
    path: string,
    data: string,
    encoding: "utf8"
  ): Promise<void>;
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
}

declare module "node:url" {
  export function fileURLToPath(url: string): string;
  export function pathToFileURL(path: string): { readonly href: string };
}
