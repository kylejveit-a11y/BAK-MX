import 'react-native-url-polyfill/auto';
import {registerRootComponent} from 'expo';
import {Platform} from 'react-native';
import App from './src/App';
registerRootComponent(App);
// Android home-screen widgets draw themselves through this task, even with the app closed.
if(Platform.OS==='android'){
 const {registerWidgetTaskHandler}=require('react-native-android-widget') as typeof import('react-native-android-widget');
 registerWidgetTaskHandler(require('./src/widgets/androidWidgetTask').androidWidgetTaskHandler);
}
