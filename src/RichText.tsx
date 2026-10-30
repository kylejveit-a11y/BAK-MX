import {useEffect,useState,type ReactNode} from 'react';
// Renders the small subset of Markdown that Ask BAK replies use (headings, bold, bullets, numbered steps, tables).
// Text is only ever placed in React text nodes, so nothing a model or a rider writes can become markup.
// On a phone-width screen a table reads as rows ("Header: value · Header: value"), like the phone app; wider screens keep the grid.
const NARROW='(max-width:760px)';
function useNarrow(){
 const [narrow,setNarrow]=useState(()=>typeof window!=='undefined'&&'matchMedia' in window?window.matchMedia(NARROW).matches:false);
 useEffect(()=>{if(!('matchMedia' in window))return;const mq=window.matchMedia(NARROW),on=()=>setNarrow(mq.matches);on();mq.addEventListener('change',on);return()=>mq.removeEventListener('change',on);},[]);
 return narrow;
}
function inline(text:string,key:string):ReactNode[]{
 return text.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean).map((part,i)=>part.startsWith('**')&&part.endsWith('**')&&part.length>4?<strong key={key+i}>{part.slice(2,-2)}</strong>:<span key={key+i}>{part.replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,;:!?]|$)/g,'$1$2')}</span>);
}
const cells=(line:string)=>line.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
export function RichText({text,className}:{text:string;className?:string}){
 const narrow=useNarrow();
 const lines=text.replace(/\r/g,'').split('\n'),out:ReactNode[]=[];
 let i=0,k=0;
 while(i<lines.length){
  const line=lines[i];
  if(!line.trim()){i++;continue;}
  const heading=line.match(/^\s{0,3}#{1,4}\s+(.*)$/);
  if(heading){out.push(<h4 key={k++}>{inline(heading[1].replace(/\s*#+\s*$/,''),'h'+k)}</h4>);i++;continue;}
  if(/^\s*\|.*\|\s*$/.test(line)&&i+1<lines.length&&/^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1])&&lines[i+1].includes('-')){
   const head=cells(line),rows:string[][]=[];i+=2;
   while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){rows.push(cells(lines[i]));i++;}
   if(narrow){out.push(<div className="hb-rows" key={k++}>{rows.map((r,n)=><p key={n}>{head.map((h,m)=>r[m]?<span key={m}><span className="hb-rows-h">{m?' · ':''}{h}: </span>{inline(r[m],'c'+n+m)}</span>:null)}</p>)}</div>);continue;}
   out.push(<div className="rich-table" key={k++}><table><thead><tr>{head.map((c,n)=><th key={n}>{inline(c,'th'+n)}</th>)}</tr></thead><tbody>{rows.map((r,n)=><tr key={n}>{head.map((_,m)=><td key={m}>{inline(r[m]??'','td'+n+m)}</td>)}</tr>)}</tbody></table></div>);
   continue;
  }
  const bullet=/^\s*[-*•]\s+/,numbered=/^\s*\d{1,2}[.)]\s+/;
  if(bullet.test(line)||numbered.test(line)){
   const ordered=numbered.test(line),mark=ordered?numbered:bullet,items:string[]=[];
   while(i<lines.length&&(mark.test(lines[i])||(/^\s{2,}\S/.test(lines[i])&&items.length&&!bullet.test(lines[i])&&!numbered.test(lines[i])))){if(mark.test(lines[i]))items.push(lines[i].replace(mark,''));else items[items.length-1]+=' '+lines[i].trim();i++;}
   const body=items.map((item,n)=><li key={n}>{inline(item,'li'+n)}</li>);
   out.push(ordered?<ol key={k++}>{body}</ol>:<ul key={k++}>{body}</ul>);
   continue;
  }
  const para:string[]=[];
  while(i<lines.length&&lines[i].trim()&&!/^\s{0,3}#{1,4}\s+/.test(lines[i])&&!bullet.test(lines[i])&&!numbered.test(lines[i])&&!/^\s*\|.*\|\s*$/.test(lines[i])){para.push(lines[i].trim());i++;}
  out.push(<p key={k++}>{inline(para.join(' '),'p'+k)}</p>);
 }
 return <div className={'rich-text '+(className??'')}>{out}</div>;
}
