#!/usr/bin/env python3
"""Diff two V8 heap snapshots from one process: aggregate the nodes present in B
and absent from A (by stable node id) by (type, name), then print shortest
retainer paths from the GC roots for samples of the largest groups."""
import json, sys, re, collections
import numpy as np


def load(path):
    with open(path, "rb") as f:
        data = f.read()
    def section(key):
        start = data.index(b'"' + key.encode() + b'":')
        start = data.index(b"[", start) + 1
        end = data.index(b"]", start)
        return start, end
    meta_start = data.index(b'"snapshot":')
    meta_end = data.index(b'"nodes":')
    meta = json.loads(b"{" + data[meta_start:meta_end].rstrip().rstrip(b",") + b"}")["snapshot"]["meta"]
    ns, ne = section("nodes")
    nodes = np.array(data[ns:ne].split(b","), dtype=np.int64) if ne > ns else np.zeros(0, np.int64)
    es, ee = section("edges")
    edges = np.array(data[es:ee].split(b","), dtype=np.int64)
    ss = data.index(b'"strings":')
    ss = data.index(b"[", ss)
    strings = json.loads(data[ss:data.rindex(b"]") + 1])
    return meta, nodes, edges, strings


def view(path):
    meta, nodes, edges, strings = load(path)
    nf = meta["node_fields"]; nfc = len(nf)
    ef = meta["edge_fields"]; efc = len(ef)
    node_types = meta["node_types"][0]; edge_types = meta["edge_types"][0]
    n = len(nodes) // nfc
    N = nodes.reshape(n, nfc)
    E = edges.reshape(len(edges) // efc, efc)
    col = {k: i for i, k in enumerate(nf)}; ecol = {k: i for i, k in enumerate(ef)}
    first_edge = np.zeros(n + 1, dtype=np.int64)
    first_edge[1:] = np.cumsum(N[:, col["edge_count"]])
    return dict(meta=meta, N=N, E=E, strings=strings, col=col, ecol=ecol, node_types=node_types,
                edge_types=edge_types, first_edge=first_edge, nfc=nfc, n=n)


def main():
    a, b = sys.argv[1], sys.argv[2]
    topk = int(sys.argv[3]) if len(sys.argv) > 3 else 25
    A = view(a)
    ids_a = set(A["N"][:, A["col"]["id"]].tolist())
    del A
    B = view(b)
    N, E, S, col, ecol = B["N"], B["E"], B["strings"], B["col"], B["ecol"]
    ntypes, etypes = B["node_types"], B["edge_types"]
    ids = N[:, col["id"]]
    new_mask = np.array([i not in ids_a for i in ids.tolist()])
    sizes = N[:, col["self_size"]]
    print(f"B nodes {B['n']}, new {new_mask.sum()}, new self bytes {sizes[new_mask].sum()/1048576:.1f} MB, total {sizes.sum()/1048576:.1f} MB")
    groups = collections.defaultdict(lambda: [0, 0, []])
    for i in np.nonzero(new_mask)[0].tolist():
        t = ntypes[N[i, col["type"]]]; name = S[N[i, col["name"]]]
        key = (t, name[:80] if t not in ("string", "concatenated string", "sliced string") else "<str>")
        g = groups[key]; g[0] += int(sizes[i]); g[1] += 1
        if len(g[2]) < 5: g[2].append(i)
    top = sorted(groups.items(), key=lambda kv: -kv[1][0])[:topk]
    for (t, name), (sz, cnt, _) in top:
        print(f"{sz/1048576:9.2f} MB {cnt:9d}  {t:20s} {name}")
    # reverse BFS from roots (node 0) to give each node a parent edge
    n = B["n"]; fe = B["first_edge"]; nfc = B["nfc"]
    to = E[:, ecol["to_node"]] // nfc
    etype = E[:, ecol["type"]]; ename = E[:, ecol["name_or_index"]]
    weak = etypes.index("weak")
    parent = np.full(n, -1, dtype=np.int64); pedge = np.full(n, -1, dtype=np.int64)
    parent[0] = 0
    frontier = [0]
    while frontier:
        nxt = []
        for u in frontier:
            for e in range(fe[u], fe[u + 1]):
                if etype[e] == weak: continue
                v = to[e]
                if parent[v] == -1:
                    parent[v] = u; pedge[v] = e; nxt.append(v)
        frontier = nxt
    def label(i):
        return f"{ntypes[N[i, col['type']]]}:{S[N[i, col['name']]][:60]!r}@{N[i, col['id']]}"
    def elabel(e):
        t = etypes[etype[e]]
        nm = ename[e] if t in ("element", "hidden") else S[ename[e]]
        return f"-[{t}:{str(nm)[:40]}]->"
    for (t, name), (sz, cnt, samples) in top[:12]:
        print(f"\n== {t} {name} ({sz/1048576:.2f} MB, {cnt})")
        for i in samples[:2]:
            path = []; v = i; steps = 0
            while v != 0 and parent[v] != -1 and steps < 40:
                path.append(elabel(pedge[v]) + label(v)); v = parent[v]; steps += 1
            print("  root " + " ".join(reversed(path)) if parent[i] != -1 else "  unreachable(strong)")


if __name__ == "__main__":
    main()
