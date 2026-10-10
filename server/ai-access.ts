import {HttpError} from './validation.ts';
/** Beta keeps unfinished Ask BAK usable; subscription mode remains an explicit release setting. */
export function aiAccessMode(value=process.env.AI_ACCESS_MODE):'beta'|'subscription'{const mode=value??'beta';if(mode!=='beta'&&mode!=='subscription')throw new HttpError(503,'AI access configuration is invalid');return mode;}
