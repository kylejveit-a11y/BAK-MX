import type {RepresentativeAssetId} from './bike-asset-contract.ts';
import {typeOf} from './part-types.ts';
import {readInstalled,type InstalledPart} from './installed-parts.ts';
export type Finish='anodized'|'powder'|'polished'|'brushed'|'titanium'|'carbon'|'matte'|'gloss'|'stock';
export type PartColor={id:string;name:string;hex?:string;finish:Finish;status:'VERIFIED'|'APPROXIMATE';source:string;nameVerified?:boolean};
const renthal='https://renthal.com/collections/fatbar-handlebars-moto';
const excel='https://rkexcelamerica.com/products/excel-rims/takasago/';
const fmf='https://www.fmfracing.com/products/factory-4-1-rct-titanium-anodized-full-system-w-carbon-end-cap-45673';
const polisport='https://www.polisport.com/en/off-road/replica-plastics/ktm-plastics/full-plastic-kit-ktm-sxsx-fxcxc-f-2025-26_p16116.html';
const odi='https://www.odigrips.com/collections/moto-grips/products/rogue-mx-single-ply-grips';
const axp='https://www.axp-racing.com/en/skid-plates-6mm/250-skid-plate-ktm-450-500-husqvarna-450-501-gasgas-450-500-black-ax1651.html';
const xtrig='https://www.xtrig-shop.com/en_US';
const slip='https://www.fmfracing.com/collections/emissions-controlled-exempt/products/factory-4-1-rct-titanium-anodized-sl-slip-on-w-carbon-cap-045669';
const rk='https://global.rk-japan.co.jp/products/motorcycle-chains/mxu/';
// Names are supported by maker pages; display hex values are NOT manufacturer color standards.
const color=(id:string,name:string,hex:string,finish:Finish,source:string):PartColor=>({id,name,hex,finish,status:'APPROXIMATE',nameVerified:true,source});
export const plasticsColors:PartColor[]=[color('white','White','#eeeeea','gloss',polisport),color('black','Black','#17191b','gloss',polisport.replace('p16116','p16117')),color('nardo-grey','Nardo Grey','#777d80','gloss',polisport.replace('p16116','p16118'))];
export type VisualMapping={id:string;brand:string;name:string;partType:string;target:string;asset?:RepresentativeAssetId;hardpoint:string;fitmentEvidence:{status:'CATALOG_LISTED'|'MANUFACTURER_LISTED';source:string;note:string};colors:PartColor[]};
export const visualMappings:VisualMapping[]=[
 {id:'rk-mxu',brand:'RK',name:'GB520 MXU Chain',partType:'chain',target:'chain',hardpoint:'rear-axle',fitmentEvidence:{status:'CATALOG_LISTED',source:rk,note:'520MXU family. Link count and sprocket compatibility require confirmation.'},colors:[color('gold','Gold','#b49a43','stock',rk)]},
 {id:'odi-rogue',brand:'ODI',name:'Rogue Single Ply MX Grips',partType:'grips',target:'grips',hardpoint:'bar-clamp',fitmentEvidence:{status:'CATALOG_LISTED',source:odi,note:'Twist-throttle grip family; verify bar and throttle tube compatibility.'},colors:[['black','Black','#191919'],['blue','Blue','#245ca6'],['red','Red','#bc252b'],['orange','Orange','#ef671c'],['soft-grey','Soft-Grey','#919599']].map(([id,n,h])=>color(id,n,h,'stock',odi))},
 {id:'axp-skid',brand:'AXP Racing',name:'Skid Plate',partType:'skid plate',target:'skid-plate',asset:'generic-skid-plate',hardpoint:'engine-cradle',fitmentEvidence:{status:'CATALOG_LISTED',source:axp,note:'AX1651/52/53 family; confirm exact application before purchase. Representative shape only.'},colors:[color('black','Black','#191919','stock',axp),color('orange','Orange','#ef671c','stock','https://www.axp-racing.com/en/skid-plates-6mm/252-skid-plate-husqvarna-fc450-fe450-fx450-fe501-blue-ax1653.html'),color('blue','Blue','#245ca6','stock','https://www.axp-racing.com/en/skid-plates-6mm/252-skid-plate-husqvarna-fc450-fe450-fx450-fe501-blue-ax1653.html')]},
 {id:'xtrig-rocs',brand:'Xtrig',name:'ROCS Pro Triple Clamps',partType:'billet triple clamps',target:'clamps',asset:'generic-clamps',hardpoint:'steering-stem',fitmentEvidence:{status:'CATALOG_LISTED',source:xtrig,note:'Family-level colors; offset and exact application must be verified separately.'},colors:[color('orange','Orange','#ed661c','stock',xtrig),color('xtrig-brown','Xtrig-brown','#75604e','stock',xtrig)]},
 {id:'acerbis-handguards',brand:'Acerbis',name:'X Ultimate Handguards',partType:'open hand guards',target:'hand-guards',asset:'generic-hand-guards',hardpoint:'bar-clamp',fitmentEvidence:{status:'CATALOG_LISTED',source:'https://www.acerbisusa.com/p11999-x-ultimate',note:'Open handguard family; mounting compatibility must be checked. No researched colors yet.'},colors:[]},
 {id:'fmf-slip',brand:'FMF',name:'Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap',partType:'slip-on exhaust',target:'exhaust-muffler',asset:'generic-slip-on',hardpoint:'muffler-mount',fitmentEvidence:{status:'MANUFACTURER_LISTED',source:slip,note:'045669 maker application lists KTM 450 SX-F 2023–2027. Generic muffler retains stock header.'},colors:[color('blue-anodized','Blue Anodized','#315ca0','anodized',slip)]},
 {id:'renthal-fatbar',brand:'Renthal',name:'Fatbar Handlebars 1-1/8"',partType:'fat bar',target:'bars',asset:'generic-fatbar',hardpoint:'bar-clamp',fitmentEvidence:{status:'CATALOG_LISTED',source:renthal,note:'Family-level listing; bend and clamp compatibility must be checked. Representative fat-bar geometry, not exact bend.'},colors:[['black','Black','#191919'],['blue','Blue','#234f9c'],['red','Red','#ba252b'],['green','Green','#2c873f'],['orange','Orange','#ed661c'],['tanium','Tanium','#827566'],['grey','Grey','#777b7e']].map(([id,n,h])=>color(id,n,h,'stock',renthal))},
 ...(['Front','Rear'] as const).map(side=>({id:'excel-'+side.toLowerCase(),brand:'Excel',name:side==='Front'?'Takasago 1.60" x 21" Front Rim':'Takasago 2.15" x 19" Rear Rim',partType:side.toLowerCase()+' rim',target:side.toLowerCase()+'-rim',hardpoint:side.toLowerCase()+'-axle',fitmentEvidence:{status:'CATALOG_LISTED' as const,source:excel,note:'Verify spoke drilling and hub application; finish-only visualization is not fitment certification.'},colors:[color('black','Black','#191919','stock',excel),color('gold','Gold','#b49a43','stock',excel)]})),
 {id:'fmf-full',brand:'FMF',name:'Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap',partType:'full exhaust',target:'exhaust',asset:'generic-full-exhaust',hardpoint:'exhaust-port',fitmentEvidence:{status:'MANUFACTURER_LISTED',source:fmf,note:'045673 lists KTM 450 SX-F 2023–2027. Geometry remains representative, not FMF geometry.'},colors:[color('blue-anodized','Blue Anodized','#315ca0','anodized',fmf)]},
];
const normalize=(s:string)=>s.trim().toLowerCase().replace(/"/g,'').replace(/\s+/g,' ');
export function visualMappingFor(p:Pick<InstalledPart,'b'|'n'>){return visualMappings.find(m=>normalize(m.brand)===normalize(p.b)&&normalize(m.name)===normalize(p.n));}
export function catalogColors(brand:string,name:string){return visualMappingFor({b:brand,n:name})?.colors??[];}
export type VisualBuild={plastics?:PartColor;parts:{mappingId:string;target:string;asset?:RepresentativeAssetId;hardpoint:string;color?:PartColor;label:string}[]};
export function resolveVisualBuild(configuration:Record<string,unknown>|null|undefined):VisualBuild{
 const saved=readInstalled(configuration);
 const exhaustSelections=saved.parts.filter(p=>p.s==='exhaust'&&['Full exhaust system','Slip-on muffler'].includes(typeOf(p.s,p.n)??'')).length;
 const parts:VisualBuild['parts']=[];
 const systems:Record<string,string>={bars:'controls',grips:'controls',clamps:'chassis','front-rim':'wheels','rear-rim':'wheels',exhaust:'exhaust','exhaust-muffler':'exhaust','skid-plate':'protection','hand-guards':'controls',chain:'gearing'};
 for(const p of saved.parts){const m=visualMappingFor(p);if(!m||p.x||systems[m.target]!==p.s)continue;const chosen=m.colors.find(c=>c.id===p.color);
  // Multiple selections for the same slot are ambiguous; show stock for that slot.
  parts.push({mappingId:m.id,target:m.target,asset:m.asset,hardpoint:m.hardpoint,color:chosen,label:`shown as: ${m.partType}, ${chosen?chosen.name+' ('+chosen.status.toLowerCase()+' swatch)':'stock finish'}${m.asset?' · representative shape, not product geometry':' · stock shape'}`});
 }
 const slot=(target:string)=>target.startsWith('exhaust')?'exhaust':target;
 return {plastics:plasticsColors.find(c=>c.id===saved.plastics),parts:parts.filter(p=>!(slot(p.target)==='exhaust'&&exhaustSelections>1)&&parts.filter(q=>slot(q.target)===slot(p.target)).length===1)};
}
