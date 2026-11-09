// What a rider sees when something fails. Messages BAK wrote (a plain Error, or the API's own error text) pass through;
// a raw JavaScript failure ("Cannot read property 'summary' of undefined") never reaches the screen.
const RAW=/^(TypeError|RangeError|ReferenceError|SyntaxError|URIError|EvalError|AggregateError)$/;
const RAW_TEXT=/undefined is not|null is not|cannot read propert|is not a function|is not an object|unexpected token|maximum call stack/i;
export const OUR_FAULT='Something went wrong on our side. Try again.';
/** True for an Error we wrote (or the API sent), false for a runtime failure in the code itself. */
export function isOurMessage(e:unknown):e is Error{
 if(!(e instanceof Error)||!e.message)return false;
 if(RAW.test(e.name)||RAW.test(e.constructor?.name??''))return false;
 return !RAW_TEXT.test(e.message);
}
export function userErrorText(e:unknown,fallback=OUR_FAULT):string{return isOurMessage(e)?e.message:fallback;}
