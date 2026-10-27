// The app's live colours. Accent and primary follow the active bike's maker (shared/brand-theme.ts) unless the rider chose BAK
// blue; everything else is fixed. Components read colors.accent while rendering, so a bike switch recolours each screen as it
// re-renders. Kept free of imports from the UI so any component can use it.
import {BAK_THEME,withAlpha,type BrandTheme} from '../../../shared/brand-theme';

export const colors={bg:'#060609',panel:'#121418',text:'#f6f7f9',muted:'#bcc3cd',primary:BAK_THEME.deep,accent:BAK_THEME.accent,glow:BAK_THEME.glow,line:'#30353f'};
let current:BrandTheme=BAK_THEME;
/** Switch the accent layer to a bike's colour. Returns true when it changed. */
export function applyTheme(t:BrandTheme){if(t.key===current.key)return false;current=t;colors.accent=t.accent;colors.primary=t.deep;colors.glow=t.glow;return true;}
export const currentTheme=()=>current;
/** The accent at an opacity, for chip fills and soft highlights. */
export const tint=(alpha:number)=>withAlpha(colors.accent,alpha);
/** The accent lifted toward white, for the bright top edge of metal finishes. */
export const metalHighlight=()=>mix(colors.accent,'#ffffff',0.45);
const mix=(a:string,b:string,t:number)=>{const p=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('');};
export const glowTint=(alpha:number)=>withAlpha(colors.glow,alpha);
