// Public pages the App Store listing and the app link to: bakmx.com/privacy, /terms and /support. BAK MX's own pages only
// (BAK Tech EMOTO is a separate product with its own support). Text lives in docs/legal so the published copy and the
// reviewed copy are the same file.
import privacy from '../docs/legal/PRIVACY_POLICY.md?raw';
import terms from '../docs/legal/TERMS.md?raw';
import {RichText} from './RichText';

export const LEGAL_PATHS=['/privacy','/terms','/support','/delete-account'];
const DELETE_ACCOUNT=`# Delete your BAK MX account

You can delete your BAK MX account and its data at any time.

## In the app (fastest)

1. Open BAK MX on your iPhone or Android phone, or sign in at bakmx.com.
2. Go to **Account → Delete account**.
3. Tap **Permanently delete account** and confirm.

Your account is deleted right away.

## By email

If you can't sign in, email **support@bakmx.com** from the email address on your account with the subject "Delete my
account". We confirm it's you and delete the account, normally within two business days.

## What is deleted

Your account, email and sign-in (including Sign in with Apple), your bikes and Garage, build sheets, service and setup
history, Ask BAK conversations, photos, clips, uploaded manuals, profile, posts, comments, likes, events, RSVPs and
messages. Deleted data is removed from our live systems right away and from backups within 30 days. We may keep a record
of purchases where tax or payment law requires it.

## Delete some data without deleting your account

Remove a bike, photo, post, comment, event or manual from where it appears in the app, or edit your profile. Account →
Export my data gives you a copy first if you want one.

## Subscriptions

Deleting your account cancels a web (Stripe) plan. App Store and Google Play subscriptions are billed by Apple or Google:
cancel them in your Apple ID or Google Play subscriptions so you are not charged again.

[Privacy policy](/privacy) · [Support](/support)`;

const SUPPORT=`# BAK MX Support

Need help with your Garage, the build sheet, Ask BAK, community posts, events, messages, your plan or your account?

## Email us

**support@bakmx.com** — app help, account questions, bug reports, billing and safety concerns. Include the bike (year, make,
model) and what you were doing, and a screenshot if you can. We reply as soon as we can, normally within two business days.

## In the app

- **Account → Tell us what's missing or wrong** sends a wrong answer, a missing spec or a bug straight to us with your bike
  attached.
- **Report** on a post or rider profile flags content for review; **Block** stops a rider from contacting you.

## Your account and data

- **Export my data** and **Permanently delete account** are in Account. Can't sign in? See [Delete your account](/delete-account).
- App Store subscriptions are managed in your Apple ID settings, Google Play subscriptions in Google Play → Payments & subscriptions, web plans in Account → Manage subscription.

[Privacy policy](/privacy) · [Terms of use](/terms)`;

export function LegalPage({path}:{path:string}){
 const text=path==='/privacy'?privacy:path==='/terms'?terms:path==='/delete-account'?DELETE_ACCOUNT:SUPPORT;
 const [title,...rest]=text.split('\n');
 return <div className="shell"><header className="app-header"><div className="header-inner"><a className="brand" href="/" aria-label="BAK MX home"><span className="brand-lockup"><img className="brand-logo" src="/bak-mx-logo.png" alt=""/></span></a></div></header>
  <main className="content legal-page" style={{maxWidth:760}}>
   <h1 style={{fontSize:32,marginTop:12}}>{title.replace(/^#\s*/,'')}</h1>
   <RichText text={rest.join('\n').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1')} className="legal-text"/>
   <p className="subtle" style={{margin:'36px 0 60px'}}><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms of use</a> · <a href="/support">Support</a></p>
  </main></div>;
}
