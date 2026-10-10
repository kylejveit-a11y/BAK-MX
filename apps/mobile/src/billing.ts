import {Platform} from 'react-native';
import Purchases,{type PurchasesPackage} from 'react-native-purchases';
import {api,supabase} from './api';
const key=Platform.OS==='ios'?process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY:process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
let initialized=false;
export async function identifyPurchaser(){if(!key)throw new Error('Store membership is not configured in this build.');const {data}=await supabase!.auth.getUser();if(!data.user)throw new Error('Sign in before accessing purchases.');if(!initialized){Purchases.configure({apiKey:key,appUserID:data.user.id});initialized=true;}else await Purchases.logIn(data.user.id);}
export async function offerings(){await identifyPurchaser();return (await Purchases.getOfferings()).current?.availablePackages??[];}
export async function purchase(p:PurchasesPackage){await identifyPurchaser();await Purchases.purchasePackage(p);return api('/api/mobile/sync-entitlement','POST',{});}
export async function restore(){await identifyPurchaser();await Purchases.restorePurchases();return api('/api/mobile/sync-entitlement','POST',{});}
