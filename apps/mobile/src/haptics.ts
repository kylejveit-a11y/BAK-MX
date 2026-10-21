// One place for touch feedback, so every control feels the same. Silent where the device has no haptics.
import * as Haptics from 'expo-haptics';
const safe=(p:Promise<void>)=>{void p.catch(()=>{});};
/** Buttons, rows and links. */
export const tap=()=>safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
/** Primary actions: send, post, save, done. */
export const press=()=>safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
/** Changing a choice: tabs, chips, toggles, wheel ticks. */
export const select=()=>safe(Haptics.selectionAsync());
/** Something finished: answer arrived, post published, saved. */
export const success=()=>safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warn=()=>safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
/** Wraps a handler so it buzzes first. */
export const withTap=<A extends unknown[]>(fn:((...a:A)=>void)|undefined,kind:()=>void=tap)=>fn?(...a:A)=>{kind();fn(...a);}:undefined;
