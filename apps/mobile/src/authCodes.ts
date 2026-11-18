// A sign-in code from Google (or an email link) can be swapped for a session only once. On Android the same return
// link can reach both the in-app browser and the app's link handler, so whichever claims the code first uses it.
const used=new Set<string>();
export function claimCode(code:string):boolean{
 if(used.has(code))return false;
 used.add(code);
 return true;
}
