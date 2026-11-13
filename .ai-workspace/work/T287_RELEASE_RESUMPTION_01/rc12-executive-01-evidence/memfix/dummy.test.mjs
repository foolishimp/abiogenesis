import test from "node:test";
const keep = [];
for (const n of ["a1","a2","b1"]) test(n, () => { keep.push(new Array(1e6).fill(n)); });
