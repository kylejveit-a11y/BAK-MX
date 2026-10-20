export type StaticViewId='three-quarter-left'|'left'|'top'|'right'|'three-quarter-right';
export type StaticAnchor={x:number;y:number};
export type StaticView={id:StaticViewId;label:string;shortLabel:string;src:string};
export type StaticPart={id:string;label:string;group:string;detail:string;anchors:Partial<Record<StaticViewId,StaticAnchor>>};
export type StaticConfiguratorManifest={
 version:number;
 identity:string;
 accuracy:'BLOCKOUT_NOT_OEM_VERIFIED';
 renderStatus:'PHOTO_REAL_CONCEPT_NOT_OEM_REFERENCE';
 views:StaticView[];
 parts:StaticPart[];
};

export function cycleView(ids:readonly string[],current:string,direction:-1|1){
 if(ids.length===0)return current;
 const index=Math.max(0,ids.indexOf(current));
 return ids[(index+direction+ids.length)%ids.length];
}

export function resolvePartAnchor(part:Pick<StaticPart,'anchors'>,viewId:string):StaticAnchor|null{
 return part.anchors[viewId as StaticViewId]??null;
}

export function clampZoom(value:number){
 return Math.min(2.4,Math.max(1,value));
}
