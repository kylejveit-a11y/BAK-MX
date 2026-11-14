# Builds BAK MX's Supabase Auth emails: dark, BAK blue, real logo, table layout that survives Gmail/Outlook/Apple Mail.
import json, pathlib
LOGO='https://bakmx.com/bak-mx-logo.png'
def shell(pre, title, body, button=None, after='', note=''):
    btn=''
    if button:
        label,url=button
        btn=f'''<tr><td style="padding:8px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#2F74E8" style="border-radius:26px;background:#2F74E8;background-image:linear-gradient(180deg,#5B95F2,#2F74E8 55%,#2462CC)"><a href="{url}" style="display:inline-block;padding:15px 34px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:26px">{label}</a></td></tr></table></td></tr>'''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>{title}</title></head>
<body style="margin:0;padding:0;background:#07080a" bgcolor="#07080a">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">{pre}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07080a" style="background:#07080a"><tr><td align="center" style="padding:36px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">
<tr><td style="padding:0 4px 22px"><img src="{LOGO}" width="168" alt="BAK MX" style="display:block;width:168px;height:auto;border:0"></td></tr>
<tr><td bgcolor="#121418" style="background:#121418;border:1px solid #23272f;border-top-color:#343a45;border-radius:18px;padding:30px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<tr><td style="padding:0 0 4px"><div style="width:34px;height:3px;background:#6AA4FF;border-radius:2px;font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td style="padding:12px 0 10px;font-size:24px;line-height:30px;font-weight:800;color:#f3f5f8;letter-spacing:-0.3px">{title}</td></tr>
<tr><td style="padding:0 0 18px;font-size:16px;line-height:24px;color:#c9cfd8">{body}</td></tr>
{btn}
{after}
</table></td></tr>
<tr><td style="padding:20px 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12.5px;line-height:19px;color:#7d8593">{note}<br><br>BAK MX · Know what works before your next ride.<br>Questions? <a href="mailto:support@bakmx.com" style="color:#8ab8ff;text-decoration:none">support@bakmx.com</a> · <a href="https://bakmx.com" style="color:#8ab8ff;text-decoration:none">bakmx.com</a></td></tr>
</table></td></tr></table></body></html>'''

def fallback(url):
    return f'''<tr><td style="padding:18px 0 0;font-size:13px;line-height:20px;color:#8f97a4">Button not working? Copy this link into your browser:<br><a href="{url}" style="color:#8ab8ff;word-break:break-all;text-decoration:none">{url}</a></td></tr>'''

C='{{ .ConfirmationURL }}'
T=[
 dict(key='confirmation', name='Confirm sign up', subject='Confirm your BAK MX account',
  html=shell('One tap and your Garage is ready.','Confirm your email',
   'You’re one tap from your Garage. Confirm this is your email and BAK MX is ready to go: your bike’s specs, setup and service, plus answers about your exact bike.',
   ('Confirm my email',C), fallback(C),
   'You’re getting this because someone signed up for BAK MX with {{ .Email }}. If that wasn’t you, ignore this email and no account will be made.')),
 dict(key='recovery', name='Reset password', subject='Reset your BAK MX password',
  html=shell('Choose a new password for BAK MX.','Reset your password',
   'Tap below on your phone to choose a new password for <span style="color:#f3f5f8">{{ .Email }}</span>. The link works once and expires soon.',
   ('Choose a new password',C), fallback(C),
   'Didn’t ask for this? Ignore it. Your password stays the same and nobody can change it without this link.')),
 dict(key='email_change', name='Change email address', subject='Confirm your new BAK MX email',
  html=shell('Confirm the new email on your BAK MX account.','Confirm your new email',
   'You asked to change your BAK MX email from <span style="color:#f3f5f8">{{ .Email }}</span> to <span style="color:#f3f5f8">{{ .NewEmail }}</span>. Tap below to confirm. Nothing changes until you do.',
   ('Confirm new email',C), fallback(C),
   'Didn’t ask for this? Ignore this email and your account keeps its current email.')),
 dict(key='password_changed_notification', name='Password changed (Security)', subject='Your BAK MX password was changed',
  html=shell('Your BAK MX password was just changed.','Your password was changed',
   'The password for your BAK MX account <span style="color:#f3f5f8">{{ .Email }}</span> was just changed. If that was you, you’re all set.',
   None, '<tr><td style="padding:0;font-size:15px;line-height:23px;color:#c9cfd8"><strong style="color:#f3f5f8">Wasn’t you?</strong> Open BAK MX, tap <em>Forgot password</em> to take your account back, then email <a href="mailto:support@bakmx.com" style="color:#8ab8ff;text-decoration:none">support@bakmx.com</a>.</td></tr>',
   'This is a security notice. It’s sent every time your password changes.')),
 dict(key='email_changed_notification', name='Email address changed (Security)', subject='Your BAK MX email was changed',
  html=shell('The email on your BAK MX account was changed.','Your email was changed',
   'The email on your BAK MX account was changed from <span style="color:#f3f5f8">{{ .OldEmail }}</span> to <span style="color:#f3f5f8">{{ .Email }}</span>.',
   None, '<tr><td style="padding:0;font-size:15px;line-height:23px;color:#c9cfd8"><strong style="color:#f3f5f8">Wasn’t you?</strong> Email <a href="mailto:support@bakmx.com" style="color:#8ab8ff;text-decoration:none">support@bakmx.com</a> right away and we’ll lock it down.</td></tr>',
   'This is a security notice sent to your old and new email.')),
 dict(key='identity_linked_notification', name='Sign-in method linked (Security)', subject='A new sign-in was added to your BAK MX account',
  html=shell('A new way to sign in was added to BAK MX.','New sign-in added',
   'You can now sign in to BAK MX (<span style="color:#f3f5f8">{{ .Email }}</span>) with <span style="color:#f3f5f8">{{ .Provider }}</span>. Same Garage, same history.',
   None, '<tr><td style="padding:0;font-size:15px;line-height:23px;color:#c9cfd8"><strong style="color:#f3f5f8">Wasn’t you?</strong> Email <a href="mailto:support@bakmx.com" style="color:#8ab8ff;text-decoration:none">support@bakmx.com</a> right away.</td></tr>',
   'This is a security notice.')),
]
for t in T: pathlib.Path(f"{t['key']}.html").write_text(t['html'])
pathlib.Path('templates.json').write_text(json.dumps([{k:t[k] for k in ('key','name','subject','html')} for t in T]))
print(len(T),'templates')
