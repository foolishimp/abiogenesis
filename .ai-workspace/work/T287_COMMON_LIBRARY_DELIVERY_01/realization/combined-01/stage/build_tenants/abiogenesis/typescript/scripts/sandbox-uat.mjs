#!/usr/bin/env node
import { main } from '../test_env/uat/runner.mjs';
try { process.exitCode = await main(); }
catch (error) { console.error(String(error)); process.exitCode = 2; }
