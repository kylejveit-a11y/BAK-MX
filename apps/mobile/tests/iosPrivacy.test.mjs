import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../app.config.ts';

test('iOS declares a user-facing photo-library purpose for App Store validation (ITMS-90683)',()=>{
 const purpose=config.ios?.infoPlist?.NSPhotoLibraryUsageDescription;
 assert.equal(typeof purpose,'string','NSPhotoLibraryUsageDescription is missing from the iOS Info.plist configuration');
 assert.match(purpose,/photos.*choose.*upload/i);
 assert.ok(purpose.trim().length>30,'purpose must explain why photo access is needed');
});
