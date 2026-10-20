import type { GtlProgram, ProgramStart } from "./contracts.js";
export type ProgramStartUntil = "converged";
export type ProgramRootMode = "direct" | "supervised";
export interface ProgramStartRequest {
    readonly scope: "program";
    readonly target: string;
    readonly until: ProgramStartUntil;
    readonly rootMode: ProgramRootMode;
    readonly startRef?: string;
}
export interface ResolvedProgramStart {
    readonly kind: "resolved_program_start";
    readonly targetKind: "asset" | "declared_start" | "next";
    readonly start: Readonly<ProgramStart>;
    readonly assetRef: string | null;
}
export interface ProgramStartRefusal {
    readonly kind: "program_start_refusal";
    readonly code: "ambiguous_target" | "missing_target" | "unsupported_control";
    readonly message: string;
}
export declare function resolveProgramStart(program: Readonly<GtlProgram>, request: ProgramStartRequest): ResolvedProgramStart | ProgramStartRefusal;
