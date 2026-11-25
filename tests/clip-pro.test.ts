import test from 'node:test';
import assert from 'node:assert/strict';
import {canCoachClips} from '../shared/plans.ts';
import {CLIPS_MONTHLY} from '../shared/plans.ts';
test('clip coaching: Pro without a monthly limit, Premium a few as a preview, Free none',()=>{assert.equal(canCoachClips('pro'),true);assert.equal(canCoachClips('premium'),true);assert.equal(canCoachClips('free'),false);assert.equal(CLIPS_MONTHLY.pro,null);assert.equal(CLIPS_MONTHLY.premium,3);});
