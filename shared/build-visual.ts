import {readInstalled,type InstalledPart} from './installed-parts.ts';
export type Finish='anodized'|'powder'|'polished'|'brushed'|'titanium'|'carbon'|'matte'|'gloss'|'stock';
export type PartColor={id:string;name:string;hex?:string;finish:Finish;status:'VERIFIED'|'APPROXIMATE';source:string;nameVerified?:boolean};
const renthal='https://renthal.com/collections/fatbar-handlebars-moto';
const excel='https://rkexcelamerica.com/products/excel-rims/takasago/';
const fmf='https://www.fmfracing.com/products/factory-4-1-rct-titanium-anodized-full-system-w-carbon-end-cap-45673';
const polisport='https://www.polisport.com/en/off-road/replica-plastics/ktm-plastics/full-plastic-kit-ktm-sxsx-fxcxc-f-2025-26_p16116.html';
// Names are supported by maker pages; display hex values are NOT manufacturer color standards.
const color=(id:string,name:string,hex:string,finish:Finish,source:string):PartColor=>({id,name,hex,finish,status:'APPROXIMATE',nameVerified:true,source});
export const plasticsColors:PartColor[]=[color('white','White','#eeeeea','gloss',polisport)];
export type VisualMapping={id:string;brand:string;name:string;partType:string;target:string;asset?:'generic-full-exhaust';hardpoint:string;fitmentEvidence:{status:'CATALOG_LISTED'|'MANUFACTURER_LISTED';source:string;note:string};colors:PartColor[]};
export const visualMappings:VisualMapping[]=[
 {id:'renthal-fatbar',brand:'Renthal',name:'Fatbar Handlebars 1-1/8"',partType:'fat bar',target:'bars',hardpoint:'bar-clamp',fitmentEvidence:{status:'CATALOG_LISTED',source:renthal,note:'Family-level listing; bend and clamp compatibility must be checked. Tier 1 stock shape only.'},colors:[['black','Black','#191919'],['blue','Blue','#234f9c'],['red','Red','#ba252b'],['green','Green','#2c873f'],['orange','Orange','#ed661c'],['tanium','Tanium','#827566'],['grey','Grey','#777b7e']].map(([id,n,h])=>color(id,n,h,'stock',renthal))},
 ...(['Front','Rear'] as const).map(side=>({id:'excel-'+side.toLowerCase(),brand:'Excel',name:side==='Front'?'Takasago 1.60" x 21" Front Rim':'Takasago 2.15" x 19" Rear Rim',partType:side.toLowerCase()+' rim',target:side.toLowerCase()+'-rim',hardpoint:side.toLowerCase()+'-axle',fitmentEvidence:{status:'CATALOG_LISTED' as const,source:excel,note:'Verify spoke drilling and hub application; finish-only visualization is not fitment certification.'},colors:[color('black','Black','#191919','stock',excel),color('gold','Gold','#b49a43','stock',excel)]})),
 {id:'fmf-full',brand:'FMF',name:'Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap',partType:'full exhaust',target:'exhaust',asset:'generic-full-exhaust',hardpoint:'exhaust-port',fitmentEvidence:{status:'MANUFACTURER_LISTED',source:fmf,note:'045673 lists KTM 450 SX-F 2023–2027. Geometry remains representative, not FMF geometry.'},colors:[color('blue-anodized','Blue Anodized','#315ca0','anodized',fmf)]},
];
const normalize=(s:string)=>s.trim().toLowerCase().replace(/"/g,'').replace(/\s+/g,' ');
export function visualMappingFor(p:Pick<InstalledPart,'b'|'n'>){return visualMappings.find(m=>normalize(m.brand)===normalize(p.b)&&normalize(m.name)===normalize(p.n));}
export function catalogColors(brand:string,name:string){return visualMappingFor({b:brand,n:name})?.colors??[];}
export type VisualBuild={plastics?:PartColor;parts:{mappingId:string;target:string;asset?:'generic-full-exhaust';hardpoint:string;color?:PartColor;label:string}[]};
export function resolveVisualBuild(configuration:Record<string,unknown>|null|undefined):VisualBuild{
 const saved=readInstalled(configuration);
 const parts:VisualBuild['parts']=[];
 for(const p of saved.parts){const m=visualMappingFor(p);if(!m)continue;const chosen=m.colors.find(c=>c.id===p.color);
  // Multiple selections for the same slot are ambiguous; show stock for that slot.
  parts.push({mappingId:m.id,target:m.target,asset:m.asset,hardpoint:m.hardpoint,color:chosen,label:`shown as: ${m.partType}, ${chosen?chosen.name+' ('+chosen.status.toLowerCase()+' swatch)':'stock finish'}${m.asset?' · representative shape, not product geometry':' · stock shape'}`});
 }
 return {plastics:plasticsColors.find(c=>c.id===saved.plastics),parts:parts.filter(p=>parts.filter(q=>q.target===p.target).length===1)};
}
