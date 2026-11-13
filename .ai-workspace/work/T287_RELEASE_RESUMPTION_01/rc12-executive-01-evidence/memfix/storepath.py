import sys, collections, numpy as np
sys.path.insert(0, sys.argv[2])
from snapdiff import view
B = view(sys.argv[1]); N,E,S,col,ecol = B["N"],B["E"],B["strings"],B["col"],B["ecol"]
nt, et = B["node_types"], B["edge_types"]; n=B["n"]; fe=B["first_edge"]; nfc=B["nfc"]
to = E[:, ecol["to_node"]] // nfc; etype = E[:, ecol["type"]]; ename = E[:, ecol["name_or_index"]]
weak = et.index("weak")
names=[S[x] for x in N[:,col["name"]].tolist()]; types=[nt[x] for x in N[:,col["type"]].tolist()]
sizes=N[:,col["self_size"]].tolist(); ids=N[:,col["id"]].tolist()
skip = set(i for i in range(min(n, 200)) if names[i] in ("(Internalized strings)", "(String table)", "(Weak collections)", "(Compilation cache)", "(Extensions)"))
def bfs(excluded):
    parent = np.full(n, -1, np.int64); pedge = np.full(n, -1, np.int64); parent[0]=0; fr=[0]
    while fr:
        nx=[]
        for u in fr:
            if u in skip: continue
            for e in range(fe[u], fe[u+1]):
                if etype[e]==weak: continue
                v=to[e]
                if v in excluded: continue
                if parent[v]==-1: parent[v]=u; pedge[v]=e; nx.append(v)
        fr=nx
    return parent, pedge
parent, pedge = bfs(set())
def label(i): return f"{types[i]}:{names[i][:60]!r}@{ids[i]}"
def elabel(e):
    t=et[etype[e]]; nm = ename[e] if t in ("element","hidden") else S[ename[e]]
    return f"-[{t}:{str(nm)[:60]}]->"
stores = [i for i in range(n) if types[i]=="object" and names[i]==sys.argv[3]]
stores.sort(key=lambda i: ids[i])
reach = parent != -1
for s in stores:
    out=[]; v=s; k=0
    while v!=0 and parent[v]!=-1 and k<60: out.append(elabel(pedge[v])+label(v)); v=parent[v]; k+=1
    print(f"== {label(s)}\n    " + "\n    ".join(reversed(out)))
    p2,_ = bfs({s})
    dom = np.nonzero(reach & (p2 == -1))[0]
    print(f"   retained (dominated) {sum(sizes[i] for i in dom)/1048576:.2f} MB in {len(dom)} nodes\n")
