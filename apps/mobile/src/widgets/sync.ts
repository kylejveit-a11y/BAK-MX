// Android and web: no Home Screen widget or Live Activity yet. iOS uses sync.ios.ts.
import type {Bike} from '../../../../shared/types';
import type {GuideStepInfo,RaceWidgetInfo} from '../widgetData';

export async function syncBikeWidget(_bike:Bike|undefined){}
export function clearBikeWidget(){}
export function syncGuideActivity(_runKey:string,_info:GuideStepInfo){}
export function endGuideActivity(){}
export function setRaceWidget(_info:RaceWidgetInfo|null){}
