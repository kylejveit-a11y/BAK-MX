// The trail map on the phone: the area's trail lines over the street map (Apple Maps on iPhone, Google Maps on Android).
// Android needs a Google Maps key in the build; without one it falls back to the lines on a plain background.
import React,{useRef} from 'react';
import {Platform,View} from 'react-native';
import Constants from 'expo-constants';
import MapView,{Polyline} from 'react-native-maps';
import {widthColor,type TrailLine} from '../../../shared/where-to-ride';
import {TrailDiagram,boundsOf} from './TrailDiagram';

export const MAP_IS_STREET=Platform.OS==='ios'||!!(Constants.expoConfig?.extra as {androidMap?:boolean}|undefined)?.androidMap;

export function TrailMap({lines,selected}:{lines:TrailLine[];selected?:string|null}){
 const ref=useRef<MapView>(null);
 if(!MAP_IS_STREET)return <TrailDiagram lines={lines} selected={selected}/>;
 const b=boundsOf(lines);
 const region={latitude:(b.minY+b.maxY)/2,longitude:(b.minX+b.maxX)/2,latitudeDelta:Math.max((b.maxY-b.minY)*1.25,0.01),longitudeDelta:Math.max((b.maxX-b.minX)*1.25,0.01)};
 return <View style={{height:420,borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:'#232832'}}>
  <MapView ref={ref} style={{flex:1}} initialRegion={region} mapType={Platform.OS==='ios'?'mutedStandard':'terrain'} userInterfaceStyle="dark" showsPointsOfInterests={false} toolbarEnabled={false} rotateEnabled={false} pitchEnabled={false}
   onMapReady={()=>ref.current?.fitToCoordinates(lines.flatMap(l=>l.line.map(([x,y])=>({latitude:y,longitude:x}))),{edgePadding:{top:30,right:30,bottom:30,left:30},animated:false})}>
   {lines.map(l=><Polyline key={l.id} coordinates={l.line.map(([x,y])=>({latitude:y,longitude:x}))} strokeColor={widthColor(l.width)} strokeWidth={selected===l.name?5:3.5} lineCap="round" lineJoin="round"/>)}
  </MapView>
 </View>;
}
