// Reads a model request whichever way it was sent: instructions as a top-level field with the question as a JSON string,
// or (answers) the instructions pinned as the first message and the question as the user message that follows.
type Sent={instructions?:string;input:unknown};
type Part={type:string;text?:string};
type Msg={role:string;content:Part[]};
export function questionOf(sent:Sent):any{
 if(typeof sent.input==='string')return JSON.parse(sent.input);
 const user=(sent.input as Msg[]).find(m=>m.role==='user')!;
 return JSON.parse(user.content.find(p=>p.type==='input_text')!.text!);
}
export function instructionsOf(sent:Sent):string{
 if(typeof sent.instructions==='string')return sent.instructions;
 return (sent.input as Msg[]).filter(m=>m.role==='developer').map(m=>m.content[0].text!).join('\n\n');
}
