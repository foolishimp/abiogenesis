# Implements: REQ-F-CORE-001
"""
genesis — GTL-native AI SDLC engine.

Consumes Module, Graph, GraphVector, Node natively.

    binding      — Job, Worker, BoundJob, bind_fd, bind_fp, render_delta
    convergence  — delta, parent_converged
    interpret    — iterate, schedule, apply_selection
    services     — Scope, module_to_jobs, start, iterate_edge, gaps
    selection    — enumerate_candidates, validate_selection, SelectionDecision
    provenance   — provenance_snapshot
    events       — EventStream, emit
    projection   — project
    fp_dispatch  — Subprocess transport for F_P actor invocations (ADR-022)
    cli_adapter  — CLI entry point wiring
    selfhosting  — Bootloader consistency checks
    __main__     — CLI entry point
"""
__version__ = "2.0.0"
