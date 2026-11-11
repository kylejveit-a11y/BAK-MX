/** An error the BAK MX API answered with: its message (written for riders) and the HTTP status. Kept in its own file so sample mode can raise one without importing the API client. */
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
