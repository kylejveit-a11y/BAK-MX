// Public pages the App Store listing and the app link to: bakmx.com/privacy, /terms and /support. BAK MX's own pages only
// (BAK Tech EMOTO is a separate product with its own support). Text lives in docs/legal so the published copy and the
// reviewed copy are the same file.
import privacy from '../docs/legal/PRIVACY_POLICY.md?raw';
import terms from '../docs/legal/TERMS.md?raw';
import {RichText} from './RichText';

export const LEGAL_PATHS=['/privacy','/terms','/support'];
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

- **Export my data** and **Permanently delete account** are in Account.
- App Store subscriptions are managed in your Apple ID settings; web plans in Account → Manage subscription.

[Privacy policy](/privacy) · [Terms of use](/terms)`;

export function LegalPage({path}:{path:string}){
 const text=path==='/privacy'?privacy:path==='/terms'?terms:SUPPORT;
 const [title,...rest]=text.split('\n');
 return <div className="shell"><header className="app-header"><div className="header-inner"><a className="brand" href="/" aria-label="BAK MX home"><span className="brand-lockup"><span className="brand-mx" style={{fontSize:24}}>BAK MX</span></span></a></div></header>
  <main className="content legal-page" style={{maxWidth:760}}>
   <h1 style={{fontSize:32,marginTop:12}}>{title.replace(/^#\s*/,'')}</h1>
   <RichText text={rest.join('\n').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1')} className="legal-text"/>
   <p className="subtle" style={{margin:'36px 0 60px'}}><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms of use</a> · <a href="/support">Support</a></p>
  </main></div>;
}
