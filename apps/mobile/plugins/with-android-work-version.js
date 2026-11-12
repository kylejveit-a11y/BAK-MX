// The Android widget library pulls androidx.work:work-runtime-ktx 2.7.1, while other modules use work-runtime 2.8.1.
// From 2.8 the ktx classes moved into work-runtime, so 2.7.1 ktx + 2.8.1 runtime ship the same classes twice and the
// release build fails (checkReleaseDuplicateClasses). Lift ktx to 2.8.1, where it is an empty shell.
const {withAppBuildGradle} = require('expo/config-plugins');
const LINE = '    implementation("androidx.work:work-runtime-ktx:2.8.1") // BAK: matches work-runtime, avoids duplicate classes';
module.exports = function withAndroidWorkVersion(config) {
  return withAppBuildGradle(config, c => {
    if (!c.modResults.contents.includes('androidx.work:work-runtime-ktx:2.8.1')) {
      c.modResults.contents = c.modResults.contents.replace(/dependencies\s*\{/, m => `${m}\n${LINE}`);
    }
    return c;
  });
};
