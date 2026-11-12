// Runs when Android asks a BAK MX widget to draw itself (added, every 30 minutes, resized) — the app may be closed.
// It draws from what the app last saved; it never signs in or calls the network.
import React from 'react';
import type {WidgetTaskHandlerProps} from 'react-native-android-widget';
import {BikeWidgetAndroid,NextEventWidgetAndroid} from './AndroidWidgets';
import {bikePropsNow,nextEventNow,readState} from './androidStore';

export const ANDROID_BIKE_WIDGET='BakBike',ANDROID_EVENT_WIDGET='BakNextEvent';
/** Wide enough for the second panel (about 4 home-screen columns). */
export const isWide=(widthDp:number)=>widthDp>=230;

export function renderAndroidWidget(name:string,widthDp:number){
 const s=readState();
 if(name===ANDROID_EVENT_WIDGET)return <NextEventWidgetAndroid p={nextEventNow(s)}/>;
 return <BikeWidgetAndroid p={bikePropsNow(s)} wide={isWide(widthDp)}/>;
}

export async function androidWidgetTaskHandler({widgetInfo,widgetAction,renderWidget}:WidgetTaskHandlerProps){
 if(widgetAction==='WIDGET_DELETED'||widgetAction==='WIDGET_CLICK')return;
 renderWidget(renderAndroidWidget(widgetInfo.widgetName,widgetInfo.width));
}
