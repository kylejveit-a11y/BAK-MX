// Adds native/ios/BakIntents.swift (Siri / Shortcuts / Action button actions) to the iOS app target at prebuild.
const fs = require('fs');
const path = require('path');
const {withDangerousMod, withXcodeProject, IOSConfig} = require('expo/config-plugins');

const FILE = 'BakIntents.swift';

module.exports = function withSiriIntents(config) {
  config = withDangerousMod(config, ['ios', async c => {
    const name = c.modRequest.projectName;
    const dest = path.join(c.modRequest.platformProjectRoot, name, FILE);
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    fs.copyFileSync(path.join(c.modRequest.projectRoot, 'native', 'ios', FILE), dest);
    return c;
  }]);
  config = withXcodeProject(config, c => {
    const name = c.modRequest.projectName;
    const filepath = `${name}/${FILE}`;
    if (!c.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({filepath, groupName: name, project: c.modResults});
    }
    return c;
  });
  return config;
};
