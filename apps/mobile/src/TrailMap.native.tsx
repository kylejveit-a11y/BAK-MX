// The trail map on the phone: the area's trail lines over the street map (Apple Maps on iPhone, Google Maps on Android).
// Android needs a Google Maps key in the build; without one it falls back to the lines on a plain background.
// Tap a line to pick that trail. With `showMe` (the rider allowed location for BAK MX) the map shows the blue dot: the
// phone draws it, nothing is sent or kept.
import React,{useRef} from 'react';
import {Platform,View} from 'react-native';
import Constants from 'expo-constants';
import MapView,{Polyline} from 'react-native-maps';
import {trailName,widthColor,type TrailLine} from '../../../shared/where-to-ride';
import {TrailDiagram,boundsOf} from './TrailDiagram';

export const MAP_IS_STREET=Platform.OS==='ios'||!!(Constants.expoConfig?.extra as {androidMap?:boolean}|undefined)?.androidMap;

export const MAP_NOTE=MAP_IS_STREET?'':'Trail lines on a plain background. The street map under them is coming to Android.';

export function TrailMap({lines,selected,onSelect,showMe=false}:{lines:TrailLine[];selected?:string|null;onSelect?:(name:string)=>void;showMe?:boolean}){
 const ref=useRef<MapView>(null);
 if(!MAP_IS_STREET)return <TrailDiagram lines={lines} selected={selected} onSelect={onSelect}/>;
 const b=boundsOf(lines);
 const region={latitude:(b.minY+b.maxY)/2,longitude:(b.minX+b.maxX)/2,latitudeDelta:Math.max((b.maxY-b.minY)*1.25,0.01),longitudeDelta:Math.max((b.maxX-b.minX)*1.25,0.01)};
 return <View style={{height:420,borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:'#232832'}}>
  <MapView ref={ref} style={{flex:1}} initialRegion={region} mapType={Platform.OS==='ios'?'mutedStandard':'terrain'} userInterfaceStyle="dark" showsPointsOfInterests={false} toolbarEnabled={false} rotateEnabled={false} pitchEnabled={false}
   showsUserLocation={showMe} showsMyLocationButton={showMe}
   onMapReady={()=>ref.current?.fitToCoordinates(lines.flatMap(l=>l.line.map(([x,y])=>({latitude:y,longitude:x}))),{edgePadding:{top:30,right:30,bottom:30,left:30},animated:false})}>
   {lines.map(l=>{const n=trailName(l),on=selected===n;return <Polyline key={l.id} coordinates={l.line.map(([x,y])=>({latitude:y,longitude:x}))} strokeColor={widthColor(l.width)} strokeWidth={on?5.5:3.5} lineCap="round" lineJoin="round" zIndex={on?2:1}
    tappable={!!onSelect} onPress={onSelect?()=>onSelect(n):undefined}/>;})}
  </MapView>
 </View>;
}
