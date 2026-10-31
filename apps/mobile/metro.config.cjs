const {getDefaultConfig}=require('expo/metro-config');
const path=require('path');
const config=getDefaultConfig(__dirname);
config.watchFolders=[path.resolve(__dirname,'../../shared'),path.resolve(__dirname,'../../scripts/web-visual')];
config.resolver.disableHierarchicalLookup=true;
// expo keeps a few development-only packages (the error overlay) in its own node_modules; listed last so nothing else changes.
config.resolver.nodeModulesPaths=[path.resolve(__dirname,'node_modules'),path.resolve(__dirname,'node_modules/expo/node_modules')];
module.exports=config;
