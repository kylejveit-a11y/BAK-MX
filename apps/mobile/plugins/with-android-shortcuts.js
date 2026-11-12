// Android's answer to Siri and Shortcuts: long-press the BAK MX icon for Ask BAK, Snap a part, Log a setup change and
// Service log. Each opens the same bakmx:// link the iPhone actions use, so the app handles them in one place.
// Writes res/xml/shortcuts.xml, four small icons and the labels, and points the main activity at them.
const fs = require('fs');
const path = require('path');
const {withAndroidManifest, withDangerousMod, withStringsXml, AndroidConfig} = require('expo/config-plugins');

const SHORTCUTS = [
  {id: 'ask', url: 'bakmx://ask', short: 'Ask BAK', long: 'Ask BAK about your bike', icon: 'ic_shortcut_ask',
   path: 'M4,4h16a2,2 0 0,1 2,2v10a2,2 0 0,1 -2,2H8l-4,4V6a2,2 0 0,1 2,-2z'},
  {id: 'snap', url: 'bakmx://snap', short: 'Snap a part', long: 'Snap a part and ask BAK', icon: 'ic_shortcut_snap',
   path: 'M9,4L7.2,6H4a2,2 0 0,0 -2,2v10a2,2 0 0,0 2,2h16a2,2 0 0,0 2,-2V8a2,2 0 0,0 -2,-2h-3.2L15,4H9zM12,9a4,4 0 1,1 0,8a4,4 0 0,1 0,-8z'},
  {id: 'setup', url: 'bakmx://setup', short: 'Log a change', long: 'Log a setup change', icon: 'ic_shortcut_setup',
   path: 'M3,17v4h4L18,10l-4,-4L3,17zM20.7,7.3a1,1 0 0,0 0,-1.4l-2.6,-2.6a1,1 0 0,0 -1.4,0L15,5l4,4l1.7,-1.7z'},
  {id: 'service', url: 'bakmx://service', short: 'Service log', long: 'Open the service log', icon: 'ic_shortcut_service',
   path: 'M22.7,19l-9.1,-9.1c0.9,-2.3 0.4,-5 -1.5,-6.9c-2,-2 -5,-2.4 -7.4,-1.3L9,6L6,9L1.6,4.7C0.4,7.1 0.9,10.1 2.9,12.1c1.9,1.9 4.6,2.4 6.9,1.5l9.1,9.1c0.4,0.4 1,0.4 1.4,0l2.3,-2.3c0.5,-0.4 0.5,-1.1 0.1,-1.4z'},
];

const vector = p => `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
  <path android:fillColor="#FF2F74E8" android:pathData="${p}"/>
</vector>
`;

module.exports = function withAndroidShortcuts(config) {
  config = withStringsXml(config, c => {
    for (const s of SHORTCUTS) {
      c.modResults = AndroidConfig.Strings.setStringItem([
        {$: {name: `shortcut_${s.id}_short`, translatable: 'false'}, _: s.short},
        {$: {name: `shortcut_${s.id}_long`, translatable: 'false'}, _: s.long},
      ], c.modResults);
    }
    return c;
  });
  config = withDangerousMod(config, ['android', async c => {
    const res = path.join(c.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
    fs.mkdirSync(path.join(res, 'xml'), {recursive: true});
    fs.mkdirSync(path.join(res, 'drawable'), {recursive: true});
    for (const s of SHORTCUTS) fs.writeFileSync(path.join(res, 'drawable', `${s.icon}.xml`), vector(s.path));
    const pkg = c.android?.package ?? 'com.bakmx.app';
    const items = SHORTCUTS.map(s => `  <shortcut android:shortcutId="${s.id}" android:enabled="true" android:icon="@drawable/${s.icon}" android:shortcutShortLabel="@string/shortcut_${s.id}_short" android:shortcutLongLabel="@string/shortcut_${s.id}_long">
    <intent android:action="android.intent.action.VIEW" android:data="${s.url}" android:targetPackage="${pkg}" android:targetClass="${pkg}.MainActivity"/>
  </shortcut>`).join('\n');
    fs.writeFileSync(path.join(res, 'xml', 'shortcuts.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">\n${items}\n</shortcuts>\n`);
    return c;
  }]);
  config = withAndroidManifest(config, c => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(c.modResults);
    activity['meta-data'] = (activity['meta-data'] ?? []).filter(m => m.$['android:name'] !== 'android.app.shortcuts');
    activity['meta-data'].push({$: {'android:name': 'android.app.shortcuts', 'android:resource': '@xml/shortcuts'}});
    return c;
  });
  return config;
};
module.exports.SHORTCUTS = SHORTCUTS;
