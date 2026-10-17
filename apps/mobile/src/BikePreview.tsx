import React,{useEffect,useState,useRef} from 'react';
import {AppState,Modal,View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import type {Bike} from '../../../shared/types';
import {resolveBikeVisual} from '../../../shared/bike-visual';
import {Button,Copy,Card,colors} from './ui';
import preview from './generated/bike-preview.json';
import {readInstalled} from '../../../shared/installed-parts';
/** Offline model receives only sanitized fitted parts and preset plastics selection. */
export function BikePreview({bike}:{bike:Bike}){
 const [open,setOpen]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 const focused=useIsFocused();
 const webview=useRef<WebView>(null);
 const saved=readInstalled(bike.configuration),payload=JSON.stringify({installed_parts:saved.parts,plastics_color:saved.plastics}).replace(/</g,'\\u003c');
 const injection=`window.updateBikeBuild && window.updateBikeBuild(${payload});true;`;
 useEffect(()=>{webview.current?.injectJavaScript(injection);},[injection]);
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state!=='active')setOpen(false);});return()=>sub.remove();},[]);
 useEffect(()=>{if(!focused)setOpen(false);},[focused]);
 if(process.env.EXPO_PUBLIC_BIKE_BUILDER_PREVIEW!=='true'||!resolveBikeVisual(bike))return null;
 return <Card><Copy strong>OEM exterior preview</Copy><Copy>Development blockout. Supported fitted parts use stock or representative shapes; unmapped parts remain stock.</Copy><Button secondary title="Explore 3D bike" onPress={()=>{setError('');setOpen(true);}}/>
 <Modal visible={open&&focused} animationType="slide" onRequestClose={()=>setOpen(false)}><SafeAreaView style={{flex:1,backgroundColor:colors.bg}}><View style={{padding:12,gap:8}}><Copy strong>{bike.model_year} {bike.manufacturer} {bike.model}</Copy><Button secondary title="Back to Garage" onPress={()=>setOpen(false)}/></View>
 {open&&focused&&(error?<View style={{padding:16,gap:12}}><Copy>{error}</Copy><Button title="Retry preview" onPress={()=>{setError('');setRevision(v=>v+1);}}/></View>:<WebView ref={webview} onLoadEnd={()=>webview.current?.injectJavaScript(injection)} key={revision} style={{flex:1,backgroundColor:'#12191e'}} source={{html:preview.html}} originWhitelist={['*']} onShouldStartLoadWithRequest={request=>request.url==='about:blank'} javaScriptEnabled domStorageEnabled={false} scrollEnabled={false} bounces={false} setSupportMultipleWindows={false} allowFileAccess={false} mixedContentMode="never" onError={()=>setError('The preview could not load. Your Garage is still available.')} onContentProcessDidTerminate={()=>setError('The graphics view stopped. Restart the preview.')} onRenderProcessGone={()=>setError('The graphics view stopped. Restart the preview.')}/>)}
 </SafeAreaView></Modal></Card>;
}
