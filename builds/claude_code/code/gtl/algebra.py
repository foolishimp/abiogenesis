# Implements: REQ-L-GTL2-COMPOSE
# Implements: REQ-L-GTL2-IDENTITY
"""
gtl.algebra — Graph algebra: composition, substitution, identity, DSL sugar.

Pure functions over GTL graph types. No engine/runtime dependency.
"""
from __future__ import annotations

from gtl.graph import Graph, Node, GraphVector
from gtl.function_model import GraphFunction


def same_object(a, b) -> bool:
    """Identity equality — same .id (REQ-L-GTL2-IDENTITY-005)."""
    return a.id == b.id


def edge(source: Node, target: Node, *, operators=(), evaluators=(), **kw) -> Graph:
    """Construct a minimal one-vector graph (DSL sugar)."""
    vector = GraphVector(
        name=f"{source.name}→{target.name}",
        source=source,
        target=target,
        operators=operators,
        evaluators=evaluators,
        **kw,
    )
    return Graph(
        name=f"{source.name}→{target.name}",
        inputs=(source,),
        outputs=(target,),
        nodes=(source, target),
        vectors=(vector,),
    )


def _materialize(gf: GraphFunction) -> Graph:
    """Materialize a GraphFunction's template into a Graph."""
    if callable(gf.template):
        return gf.template()
    raise ValueError(f"Cannot materialize non-callable template: {gf.template!r}")


def compose(f: GraphFunction, g: GraphFunction) -> GraphFunction:
    """Sequential composition: f;g where f.outputs satisfy g.inputs.

    Validates:
    - Every g.input name exists in f.outputs (interface compatibility)
    - No duplicate output names between f.outputs and g.outputs
      (except interface pass-throughs — nodes in both g.inputs and g.outputs)

    Returns GraphFunction with inputs=f.inputs, outputs=g.outputs,
    effects=f.effects + g.effects. If both templates are callable, the
    composed template materializes to the union graph.
    """
    f_output_names = {n.name for n in f.outputs}
    g_input_names = {n.name for n in g.inputs}

    # Interface compatibility: every g.input must be satisfied by f.outputs
    missing = g_input_names - f_output_names
    if missing:
        raise ValueError(
            f"compose({f.name}, {g.name}): g.inputs not satisfied by f.outputs — "
            f"missing: {sorted(missing)}"
        )

    # Duplicate output check (excluding interface pass-throughs)
    g_output_names = {n.name for n in g.outputs}
    pass_throughs = g_input_names & g_output_names
    duplicates = (f_output_names & g_output_names) - pass_throughs
    if duplicates:
        raise ValueError(
            f"compose({f.name}, {g.name}): duplicate output names: {sorted(duplicates)}"
        )

    # Build composed template if both are materializable
    if callable(f.template) and callable(g.template):
        # Capture by value to avoid late-binding closure issues
        _f, _g = f, g

        def _composed_template() -> Graph:
            fg = _materialize(_f)
            gg = _materialize(_g)
            # Nodes: union by name (f's version takes priority at interface)
            node_map = {n.name: n for n in fg.nodes}
            for n in gg.nodes:
                if n.name not in node_map:
                    node_map[n.name] = n
            # Vectors: concatenation (per-vector operators/evaluators preserved)
            all_vectors = fg.vectors + gg.vectors
            # Contexts: union by name
            ctx_map = {c.name: c for c in fg.contexts}
            for c in gg.contexts:
                if c.name not in ctx_map:
                    ctx_map[c.name] = c
            return Graph(
                name=f"{_f.name};{_g.name}",
                inputs=fg.inputs,
                outputs=gg.outputs,
                nodes=tuple(node_map.values()),
                vectors=tuple(all_vectors),
                contexts=tuple(ctx_map.values()),
            )

        template = _composed_template
    else:
        template = f"{f.name};{g.name}"

    return GraphFunction(
        name=f"{f.name};{g.name}",
        inputs=f.inputs,
        outputs=g.outputs,
        template=template,
        effects=f.effects + g.effects,
    )


def substitute(outer: Graph, contract_vector: str, inner: Graph) -> Graph:
    """Replace a coarse contract vector with an interface-compatible inner graph.

    contract_vector: the .id of the target vector (REQ-L-GTL2-IDENTITY-006).
    Id-only — no name fallback.

    Validates:
    - contract_vector exists in outer.vectors (by id)
    - inner.inputs names are a subset of the vector's source node names
    - The vector's target name appears in inner.outputs

    Preserves outer contract (inputs/outputs unchanged). Adds provenance tag.
    Returns a new Graph with a new .id (REQ-L-GTL2-IDENTITY-004).
    """
    # Find the contract vector by id (REQ-L-GTL2-IDENTITY-006)
    target_vec = None
    for v in outer.vectors:
        if v.id == contract_vector:
            target_vec = v
            break
    if target_vec is None:
        raise ValueError(
            f"substitute(): vector {contract_vector!r} not found in graph {outer.name!r}"
        )

    # Extract source names (handle multi-input tuple sources)
    if isinstance(target_vec.source, tuple):
        vec_source_names = {n.name for n in target_vec.source}
    elif target_vec.source is not None:
        vec_source_names = {target_vec.source.name}
    else:
        vec_source_names = set()

    # Validate: inner.inputs ⊆ vector source names
    inner_input_names = {n.name for n in inner.inputs}
    if not inner_input_names <= vec_source_names:
        raise ValueError(
            f"substitute(): inner.inputs {sorted(inner_input_names)} not subset of "
            f"vector source {sorted(vec_source_names)}"
        )

    # Validate: vector target ∈ inner.outputs
    inner_output_names = {n.name for n in inner.outputs}
    vec_target_name = target_vec.target.name if target_vec.target else ""
    if vec_target_name and vec_target_name not in inner_output_names:
        raise ValueError(
            f"substitute(): vector target {vec_target_name!r} not in "
            f"inner.outputs {sorted(inner_output_names)}"
        )

    # Remove contract vector by id, add inner vectors
    remaining_vectors = tuple(v for v in outer.vectors if v.id != target_vec.id)
    merged_vectors = remaining_vectors + inner.vectors

    # Merge nodes: outer + inner-only (deduplicate by name)
    outer_node_names = {n.name for n in outer.nodes}
    extra_nodes = tuple(n for n in inner.nodes if n.name not in outer_node_names)
    merged_nodes = outer.nodes + extra_nodes

    # Merge contexts: outer + inner-only (deduplicate by name)
    outer_ctx_names = {c.name for c in outer.contexts}
    extra_contexts = tuple(c for c in inner.contexts if c.name not in outer_ctx_names)
    merged_contexts = outer.contexts + extra_contexts

    # Preserve outer contract (inputs/outputs unchanged), add provenance tag.
    # New id minted (REQ-L-GTL2-IDENTITY-004: transform → new identity).
    return Graph(
        name=outer.name,
        inputs=outer.inputs,
        outputs=outer.outputs,
        nodes=merged_nodes,
        vectors=merged_vectors,
        contexts=merged_contexts,
        rules=outer.rules,
        effects=outer.effects,
        tags=outer.tags + (f"substituted:{target_vec.name}",),
    )


def identity(interface: tuple[Node, ...]) -> GraphFunction:
    """Identity function — neutral element under composition."""
    return GraphFunction(
        name="id",
        inputs=interface,
        outputs=interface,
    )
