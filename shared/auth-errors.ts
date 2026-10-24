// Sign-in errors in plain words. The server's own wording ("email rate limit exceeded") means nothing to a rider.
export const authErrorText=(e:unknown)=>{const m=e instanceof Error?e.message:'',code=(e as {code?:string})?.code??'';
 if(code==='over_email_send_rate_limit'||/rate limit|only request this after/i.test(m))return 'We couldn\'t send the email just now because too many were sent in a short time. Wait a few minutes and try again.';
 if(code==='email_not_confirmed'||/email not confirmed/i.test(m))return 'Confirm your email first: open the email we sent and tap the link, then sign in. No email? Check spam, or tap Create account again in a few minutes to resend it.';
 if(code==='email_address_invalid'||/email address .* is invalid/i.test(m))return 'That email address doesn\'t look right. Check the spelling and try again.';
 if(code==='invalid_credentials'||/invalid login credentials/i.test(m))return 'That email and password don\'t match. Check both, or tap Forgot password.';
 if(code==='user_already_exists'||/already registered/i.test(m))return 'There\'s already an account with that email. Sign in instead, or tap Forgot password.';
 if(code==='weak_password'||/password should be/i.test(m))return 'Choose a longer, stronger password.';
 if(/network request failed|failed to fetch/i.test(m))return 'No connection to BAK MX. Check your signal and try again.';
 return m||'Something went wrong. Please try again.';};
