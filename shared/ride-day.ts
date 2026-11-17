// Ride Day mode: the glove-first screen for a practice day. Big targets, the few things a rider needs between sessions, the
// screen kept awake, and a tap lock so bumps and sweat press nothing. The words and quick picks live here so they can be tested
// and kept the same everywhere. Sessions, setup changes and track check-ins use the practice-day and track-report rules.

export const RIDE_DAY_COPY={
 open:'Ride Day mode',openDetail:'Big buttons for gloves, screen stays on, tap lock.',
 offTrack:'Log session',offTrackSub:'Off the track',
 change:'Setup change',changeSub:'Clickers, tires, sag',
 setup:'My setup',setupSub:'On the bike now',
 track:'Track check-in',trackSub:'How it’s riding',
 ask:'Ask BAK',askSub:'About today',
 lock:'Lock',done:'Done',back:'Back',
 howLong:'How long were you out?',skipTime:'Skip',
 anyChange:'Change anything for next session?',noChange:'No change',
 what:'What did you change?',how:'How much?',typeIt:'Type it',
 didItHelp:'How did your last change ride?',
 saved:'Saved',savedQueued:'Saved on this phone. Sends when there’s signal.',
 locked:'Locked',holdToUnlock:'Hold to unlock',
 noSetup:'Add your clickers, sag and tire pressures in Garage › Setup to see them here.',
 noTrack:'This track isn’t one of BAK’s listed tracks yet, so there’s no check-in for it.',
 checkIn:'Send check-in',
 startTitle:'Auto-lock the screen?',startDetail:'Locks itself after 3 minutes with no touch. Hold the unlock button to get back in. You can always lock by hand with the lock button.',
 autoOn:'Yes, auto-lock after 3 min',autoOff:'No, I’ll lock it myself',autoBadge:'Auto-lock 3 min',
} as const;

/** Whole-minute picks for time on track, as big buttons. */
export {SESSION_MINUTES as RIDE_MINUTES} from './practice-day.ts';

const CLICKERS=['Fork compression','Fork rebound','Shock low-speed','Shock high-speed','Shock rebound'];
/** Quick picks for "how much" for a change, in pairs (softer | stiffer, down | up) so each row of the grid is one size. Clickers: clicks softer (out) or stiffer (in), the same words every manual uses.
 *  Shock high-speed is often turns, so it gets turns too. Tires: psi down or up. Others are typed. */
export function changePresets(change:string):string[]{
 if(change==='Shock high-speed')return ['1/4 turn softer','1/4 turn stiffer','1/2 turn softer','1/2 turn stiffer','1 click softer','1 click stiffer'];
 if(CLICKERS.includes(change))return ['1 click softer','1 click stiffer','2 clicks softer','2 clicks stiffer','3 clicks softer','3 clicks stiffer'];
 if(change==='Front tire'||change==='Rear tire')return ['0.5 psi down','0.5 psi up','1 psi down','1 psi up'];
 if(change==='Sag')return ['2 mm more sag','2 mm less sag','5 mm more sag','5 mm less sag'];
 if(change==='Fork height')return ['2 mm up in the clamps','2 mm down in the clamps','5 mm up in the clamps','5 mm down in the clamps'];
 return [];
}

/** Tap lock: when the rider turns auto-lock on as Ride Day opens, the screen locks itself after this long with no touch
 *  (a phone on the plate or in a pocket). Off unless chosen. */
export const AUTO_LOCK_MS=180_000;
/** How long to hold the unlock button. Long enough that a bump never does it, short enough with gloves. */
export const UNLOCK_HOLD_MS=900;

