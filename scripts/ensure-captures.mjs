// The normalized parts capture is 147 MB as JSON, over GitHub's 100 MB file limit, so the repository stores it gzipped.
//   node scripts/ensure-captures.mjs          unpack the .json when it is missing or older than the .gz (runs before tests)
//   node scripts/ensure-captures.mjs --pack   rebuild the .gz after scripts/normalize-parts-research.ts rewrites the .json
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
const json = 'docs/research/parts/normalized-captures.json', gz = json + '.gz';
if (process.argv.includes('--pack')) {
  writeFileSync(gz, gzipSync(readFileSync(json), { level: 9 }));
  console.log('packed', gz, statSync(gz).size, 'bytes');
} else if (existsSync(gz) && (!existsSync(json) || statSync(json).mtimeMs < statSync(gz).mtimeMs)) {
  writeFileSync(json, gunzipSync(readFileSync(gz)));
  console.log('unpacked', json);
}
