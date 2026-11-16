/** App emails (ride safety) through Resend, from the verified bakmx.com domain. Needs RESEND_API_KEY in the server settings;
 *  without it nothing is sent and callers are told so (the app then says alert emails are not switched on). */
export const emailReady=()=>!!process.env.RESEND_API_KEY;
export async function sendEmail(to:string[],subject:string,text:string):Promise<boolean>{
 const key=process.env.RESEND_API_KEY;if(!key||!to.length)return false;
 const html=`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;line-height:1.5;color:#111">${text.split('\n\n').map(p=>`<p>${p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/(https:\/\/bakmx\.com\/s\/[A-Za-z0-9_-]+)/g,'<a href="$1">$1</a>').replace(/\n/g,'<br>')}</p>`).join('')}</div>`;
 try{
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({from:'BAK MX Ride Safety <safety@bakmx.com>',reply_to:'support@bakmx.com',to,subject,text,html}),signal:AbortSignal.timeout(8000)});
  return r.ok;
 }catch{return false;}
}
