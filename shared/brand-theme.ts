// App colour that follows the rider's bike. BAK blue stays on the main buttons and the brand; the bike's colour is the
// accent layer (highlights, chips, the active tab, BAK's answer marks, a faint glow behind the menus). Each maker colour is a
// deep, metallic version tuned for the dark screens — never the raw factory colour, which reads as neon on black.
// Colours only: no maker logos or names in the UI. Every accent keeps at least 4.5:1 contrast on the app background.
export type BrandTheme={key:string;label:string;accent:string;deep:string;glow:string};

export const BAK_THEME:BrandTheme={key:'bak',label:'BAK blue',accent:'#6AA4FF',deep:'#2F74E8',glow:'#2F74E8'};

const THEMES:Record<string,BrandTheme>={
 KTM:{key:'ktm',label:'Orange',accent:'#F08C42',deep:'#B85A1C',glow:'#D9651E'},
 Husqvarna:{key:'husqvarna',label:'Steel blue',accent:'#93ABE4',deep:'#2D4A8E',glow:'#34569F'},
 GasGas:{key:'gasgas',label:'Crimson',accent:'#F0627A',deep:'#B01F3D',glow:'#C4273F'},
 Honda:{key:'honda',label:'Red',accent:'#EE6650',deep:'#B2281C',glow:'#C7301F'},
 Yamaha:{key:'yamaha',label:'Racing blue',accent:'#6F97F7',deep:'#2150CF',glow:'#2758DD'},
 Kawasaki:{key:'kawasaki',label:'Green',accent:'#98CC5F',deep:'#3D7A1E',glow:'#4C9424'},
 Suzuki:{key:'suzuki',label:'Yellow',accent:'#E6CC52',deep:'#9C8114',glow:'#B8971A'},
 Triumph:{key:'triumph',label:'Amber',accent:'#E2AA48',deep:'#9A6614',glow:'#B87A18'},
};

export type ThemeMode='bike'|'bak';
/** The colour for this bike's maker, or BAK blue when the rider chose BAK blue or the maker has no colour here. */
export function themeFor(manufacturer:string|null|undefined,mode:ThemeMode='bike'):BrandTheme{
 if(mode==='bak'||!manufacturer)return BAK_THEME;
 const key=Object.keys(THEMES).find(k=>k.toLowerCase()===manufacturer.trim().toLowerCase().replace(/\s+/g,''))??Object.keys(THEMES).find(k=>k.toLowerCase()===manufacturer.trim().toLowerCase());
 return key?THEMES[key]:BAK_THEME;
}
export const allThemes=()=>[BAK_THEME,...Object.values(THEMES)];

/** "#RRGGBB" at an opacity, as rgba(). */
export function withAlpha(hex:string,alpha:number){const n=parseInt(hex.slice(1),16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;}

/** WCAG contrast ratio between two "#RRGGBB" colours. */
export function contrast(a:string,b:string){
 const lum=(h:string)=>{const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255].map(v=>{const c=v/255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[0.2126,0.7152,0.0722][i],0);};
 const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05);
}
