import test from 'node:test';
import assert from 'node:assert/strict';
import {canCoachClips} from '../shared/plans.ts';
test('clip coaching is Pro only',()=>{assert.equal(canCoachClips('pro'),true);assert.equal(canCoachClips('premium'),false);assert.equal(canCoachClips('free'),false);});
