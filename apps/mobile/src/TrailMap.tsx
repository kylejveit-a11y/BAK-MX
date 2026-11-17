// Website build: no native map, so the trail lines are drawn on their own (TrailMap.native.tsx is the phone version).
import React from 'react';
import type {TrailLine} from '../../../shared/where-to-ride';
import {TrailDiagram} from './TrailDiagram';

export const MAP_IS_STREET=false;
export function TrailMap({lines,selected}:{lines:TrailLine[];selected?:string|null}){return <TrailDiagram lines={lines} selected={selected}/>;}
