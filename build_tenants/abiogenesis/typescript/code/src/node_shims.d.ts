declare const process: {
  readonly argv: readonly string[];
  readonly stdout: { write(chunk: string): void };
  readonly stderr: { write(chunk: string): void };
  exitCode: number | undefined;
  cwd(): string;
};

declare module "node:fs/promises" {
  export function access(path: string): Promise<void>;
  export function readFile(path: string, encoding: "utf8"): Promise<string>;
  export function appendFile(
    path: string,
    data: string,
    encoding: "utf8"
  ): Promise<void>;
  export function mkdir(
    path: string,
    options: { readonly recursive: true }
  ): Promise<string | undefined>;
}

declare module "node:path" {
  export function dirname(path: string): string;
  export function isAbsolute(path: string): boolean;
  export function join(...paths: readonly string[]): string;
  export function resolve(...paths: readonly string[]): string;
}

declare module "node:url" {
  export function pathToFileURL(path: string): { readonly href: string };
}
