// Pure finite test construction, never exported or packed by ABIogenesis.
import * as gtl from '../../build/code/src/gtl/index.js';
import {constructStructuralPublication} from '../fixtures/language-structural/program.mjs';
export * from '../../build/code/src/gtl/index.js';
export * from '../fixtures/language-structural/program.mjs';
export const constructStructuralModulePublication=artifact=>constructStructuralPublication(gtl,artifact);
