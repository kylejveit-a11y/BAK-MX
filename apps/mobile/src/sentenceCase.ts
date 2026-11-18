/** Older screens wrote section labels in ALL CAPS; this turns such text into sentence case ("BAK’S SETUP · TODAY" →
 *  "BAK’s setup · Today"). Text with any lower-case letter is left alone, so names keep their own capitals. */
const KEEP_CAPS=new Set(['BAK','MX','ATV','OHV','RPM','GPS','US','AI','PDF','UTV','SX','XC','KTM']);
export function sentenceCase(t:string,first:boolean):string{
 if(!/[A-Z]/.test(t)||/[a-z]/.test(t))return t;
 let out=t.replace(/[A-Z][A-Z’']*/g,w=>{const base=w.replace(/[’']S$/,'');return KEEP_CAPS.has(base)?base+w.slice(base.length).toLowerCase():w.toLowerCase();});
 const cap=(i:number)=>{out=out.slice(0,i)+out.charAt(i).toUpperCase()+out.slice(i+1);};
 if(first){const i=out.search(/[a-z]/);if(i>=0&&!/[A-Za-z]/.test(out.slice(0,i)))cap(i);}
 out=out.replace(/(·\s+)([a-z])/g,(_,a,b)=>a+b.toUpperCase());
 return out;
}
