// Native version of the web's RichText: the small subset of Markdown Ask BAK replies use (headings, bold, bullets, numbered
// steps, tables as rows). Everything is placed in Text nodes, so nothing a model or a rider writes becomes markup.
import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {colors} from './ui';

const base={color:colors.text,fontSize:16,lineHeight:25} as const;
function inline(text:string,key:string):React.ReactNode[]{
 return text.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean).map((part,i)=>part.startsWith('**')&&part.endsWith('**')&&part.length>4
  ?<Text key={key+i} style={{fontWeight:'700',color:'#ffffff'}}>{part.slice(2,-2)}</Text>
  :<Text key={key+i}>{part.replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,;:!?]|$)/g,'$1$2')}</Text>);
}
const cells=(line:string)=>line.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
export function RichText({text}:{text:string}){
 const lines=text.replace(/\r/g,'').split('\n'),out:React.ReactNode[]=[];
 let i=0,k=0;
 const bullet=/^\s*[-*•]\s+/,numbered=/^\s*\d{1,2}[.)]\s+/;
 while(i<lines.length){
  const line=lines[i];
  if(!line.trim()){i++;continue;}
  const heading=line.match(/^\s{0,3}#{1,4}\s+(.*)$/);
  if(heading){out.push(<Text key={k++} selectable style={{...base,fontSize:17,fontWeight:'800',marginTop:4}}>{inline(heading[1].replace(/\s*#+\s*$/,''),'h'+k)}</Text>);i++;continue;}
  if(/^\s*\|.*\|\s*$/.test(line)&&i+1<lines.length&&/^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1])&&lines[i+1].includes('-')){
   const head=cells(line),rows:string[][]=[];i+=2;
   while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){rows.push(cells(lines[i]));i++;}
   // a phone is too narrow for a grid: each row reads "Header: value · Header: value"
   out.push(<View key={k++} style={{gap:6}}>{rows.map((r,n)=><Text key={n} selectable style={{...base,fontSize:15,lineHeight:22}}>{head.map((h,m)=>r[m]?[<Text key={'l'+m} style={{color:colors.muted}}>{m?' · ':''}{h}: </Text>,...inline(r[m],'c'+n+m)]:null)}</Text>)}</View>);
   continue;
  }
  if(bullet.test(line)||numbered.test(line)){
   const ordered=numbered.test(line),mark=ordered?numbered:bullet,items:string[]=[];
   while(i<lines.length&&(mark.test(lines[i])||(/^\s{2,}\S/.test(lines[i])&&items.length&&!bullet.test(lines[i])&&!numbered.test(lines[i])))){if(mark.test(lines[i]))items.push(lines[i].replace(mark,''));else items[items.length-1]+=' '+lines[i].trim();i++;}
   out.push(<View key={k++} style={{gap:6}}>{items.map((item,n)=><View key={n} style={{flexDirection:'row',gap:8}}><Text style={{...base,color:colors.muted,minWidth:16}}>{ordered?`${n+1}.`:'•'}</Text><Text selectable style={{...base,flex:1}}>{inline(item,'li'+n)}</Text></View>)}</View>);
   continue;
  }
  const para:string[]=[];
  while(i<lines.length&&lines[i].trim()&&!/^\s{0,3}#{1,4}\s+/.test(lines[i])&&!bullet.test(lines[i])&&!numbered.test(lines[i])&&!/^\s*\|.*\|\s*$/.test(lines[i])){para.push(lines[i].trim());i++;}
  out.push(<Text key={k++} selectable style={base}>{inline(para.join(' '),'p'+k)}</Text>);
 }
 return <View style={{gap:12}}>{out}</View>;
}

/** A section that starts closed: the answer stays short, the working is one tap away. */
export function Disclosure({title,children}:{title:string;children:React.ReactNode}){
 const [open,setOpen]=React.useState(false);
 return <View style={{gap:10}}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} hitSlop={6} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:4}}>
   <Text style={{color:colors.accent,fontSize:14.5,fontWeight:'600'}}>{title}</Text><Text style={{color:colors.accent,fontSize:14}}>{open?'Hide':'Show'}</Text>
  </Pressable>
  {open&&<View style={{gap:10}}>{children}</View>}
 </View>;
}
