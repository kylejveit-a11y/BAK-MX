import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
test('all-family coverage reports each inventory without claiming model support',()=>{
 const out=execFileSync(process.execPath,['--experimental-strip-types','scripts/bike-color-coverage.ts','--all'],{encoding:'utf8'});
 for(const f of ['honda','kawasaki','ktm-family','triumph','yamaha'])assert.ok(out.includes(`Inventory: ${f}.json`),f);
 assert.match(out,/not OEM model coverage/);assert.match(out,/\| Grips \| 10 \|/);
});
