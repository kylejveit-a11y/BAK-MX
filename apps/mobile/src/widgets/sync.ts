// Android and web: no Home Screen widget or Live Activity yet. iOS uses sync.ios.ts.
import type {Bike} from '../../../../shared/types';
import type {RaceDay} from '../../../../shared/race-day';
import type {GuideStepInfo,RaceActivityInfo,RaceWidgetInfo} from '../widgetData';

export async function syncBikeWidget(_bike:Bike|undefined){}
export function clearBikeWidget(){}
export function syncGuideActivity(_runKey:string,_info:GuideStepInfo){}
export function endGuideActivity(){}
export function setRaceWidget(_info:RaceWidgetInfo|null){}
export async function syncNextEventWidget(_race?:RaceDay|null){}
export function setRaceStatus(_race:RaceDay|null){}
export function clearNextEventWidget(){}
export function syncRaceActivity(_runKey:string,_info:RaceActivityInfo){}
export function endRaceActivity(){}
