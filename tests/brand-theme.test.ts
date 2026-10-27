import test from 'node:test';
import assert from 'node:assert/strict';
import {themeFor,allThemes,contrast,withAlpha,BAK_THEME} from '../shared/brand-theme.ts';

test('every bike colour reads on the dark app and keeps white marks readable on its deep tone',()=>{
 for(const t of allThemes()){
  assert.ok(contrast(t.accent,'#060609')>=4.5,`${t.key} accent on background`);
  assert.ok(contrast(t.accent,'#121418')>=4.5,`${t.key} accent on cards`);
  assert.ok(contrast('#ffffff',t.deep)>=3,`${t.key} white on deep`);
 }
});
test('the bike picks the colour; BAK blue when chosen or unknown',()=>{
 assert.equal(themeFor('KTM').key,'ktm');assert.equal(themeFor('GasGas').key,'gasgas');assert.equal(themeFor('Gas Gas').key,'gasgas');
 assert.equal(themeFor('Kawasaki','bak'),BAK_THEME);assert.equal(themeFor('Beta'),BAK_THEME);assert.equal(themeFor(undefined),BAK_THEME);
 assert.equal(withAlpha('#6AA4FF',0.16),'rgba(106,164,255,0.16)');
});
