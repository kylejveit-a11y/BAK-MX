import type {ExpoConfig} from 'expo/config';
const config:ExpoConfig={name:'BAK MX',slug:'bakmx',version:'0.1.0',scheme:'bakmx',orientation:'portrait',userInterfaceStyle:'dark',ios:{bundleIdentifier:'com.baktech.bakmx',supportsTablet:true,infoPlist:{ITSAppUsesNonExemptEncryption:false}},android:{package:'com.baktech.bakmx'},plugins:['expo-secure-store','expo-sharing','expo-status-bar'],extra:{...(process.env.EAS_PROJECT_ID?{eas:{projectId:process.env.EAS_PROJECT_ID}}:{})}};
export default config;
