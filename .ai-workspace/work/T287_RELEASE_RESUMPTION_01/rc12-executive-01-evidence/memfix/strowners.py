import sys, collections, numpy as np
sys.path.insert(0, sys.argv[4])
from snapdiff import view
A = view(sys.argv[1]); ids_a = set(A["N"][:, A["col"]["id"]].tolist()); del A
B = view(sys.argv[2]); N,E,S,col,ecol = B["N"],B["E"],B["strings"],B["col"],B["ecol"]
nt, et = B["node_types"], B["edge_types"]; n=B["n"]; fe=B["first_edge"]; nfc=B["nfc"]
to = E[:, ecol["to_node"]] // nfc; etype = E[:, ecol["type"]]; ename = E[:, ecol["name_or_index"]]
weak = et.index("weak")
skip = set(i for i in range(min(n, 200)) if S[N[i, col["name"]]] in ("(Internalized strings)", "(String table)", "(Weak collections)", "(Compilation cache)", "(Extensions)"))
parent = np.full(n, -1, np.int64); pedge = np.full(n, -1, np.int64); parent[0]=0; fr=[0]
while fr:
    nx=[]
    for u in fr:
        if u in skip: continue
        for e in range(fe[u], fe[u+1]):
            if etype[e]==weak: continue
            v=to[e]
            if parent[v]==-1: parent[v]=u; pedge[v]=e; nx.append(v)
    fr=nx
ids = N[:, col["id"]]; sizes = N[:, col["self_size"]]
strtypes = {nt.index(t) for t in ("string","concatenated string","sliced string") if t in nt}
groups = collections.defaultdict(lambda:[0,0,None])
big=[]
for i in range(n):
    if N[i,col["type"]] not in strtypes or ids[i] in ids_a: continue
    p = parent[i]
    if p == -1: key=("<unreached>",""); 
    else:
        # climb through string/array/hidden nodes to the first object-ish owner
        v=i; chain=[]
        while v!=0 and parent[v]!=-1 and nt[N[v,col["type"]]] in ("string","concatenated string","sliced string","array","hidden") and len(chain)<6:
            e=pedge[v]; t=et[etype[e]]; nm = ename[e] if t in ("element","hidden") else S[ename[e]]
            chain.append(f"{t}:{str(nm)[:30] if t not in ('element','hidden') else '#'}"); v=parent[v]
        key=(f"{nt[N[v,col['type']]]}:{S[N[v,col['name']]][:50]}", "/".join(reversed(chain)))
    g=groups[key]; g[0]+=int(sizes[i]); g[1]+=1
    if g[2] is None: g[2]=i
    big.append((int(sizes[i]), i))
for k,(sz,c,s) in sorted(groups.items(), key=lambda kv:-kv[1][0])[:int(sys.argv[3])]:
    print(f"{sz/1048576:8.2f} MB {c:8d} {k[0]}  via {k[1]}")
print("\nlargest new strings:")
big.sort(reverse=True)
for sz,i in big[:15]:
    print(f"{sz/1048576:7.2f} MB {S[N[i,col['name']]][:100]!r}")
