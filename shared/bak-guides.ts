// BAK-written guides are stored once per written guide with the exact bike-years it was checked for (scripts/build-bak-guides.ts).
// This rebuilds one ReviewedProcedure per bike-year; the step objects are shared between years, so the app stays light.
import type {ReviewedProcedure} from './procedures.ts';
export type BakGuideGroup={p:any;x:[string,string,string,number,string,string,string][]};
type Group=BakGuideGroup;
export function expandBakGuides(groups:Group[]):ReviewedProcedure[]{
 const out:ReviewedProcedure[]=[];
 for(const g of groups){
  const steps=g.p.steps.map((s:any)=>({...s,depends_on:s.depends_on??[],verification:s.verification??[],record_required:!!s.record_required,source_pdf_pages:[],source_links:[],diagram_reference_required:false}));
  for(const [id,manufacturer,model,model_year,variant,region,sha] of g.x)
   out.push({...g.p,id,steps,target:{manufacturer,model,model_year,variant,region},content_sha256:sha,source:{source_url:'',document_sha256:sha,document_revision:'BAK MX workshop guide',pdf_pages:[],printed_pages:[],review_status:'BAK_AUTHORED'}} as ReviewedProcedure);
 }
 return out;
}
