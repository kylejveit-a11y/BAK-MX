/** Ask BAK sends the rider's question and bike details to a third-party AI provider to write the answer. Apple's guideline
 *  5.1.2(i) requires telling the rider that, and getting permission, before the first question. Same text on web and iPhone. */
export const AI_CONSENT_VERSION='v3';
export const aiConsentKey=(userId:string)=>`bakmx:ai-consent:${AI_CONSENT_VERSION}:${userId}`;
export const aiConsentTitle='Before your first question';
/** Riders who agreed to an earlier version see this instead: what changed, then the same points. */
export const AI_CONSENT_PREVIOUS=['v1','v2'];
export const aiConsentUpdatedTitle='Ask BAK has been updated';
export const aiConsentUpdatedIntro='BAK can now edit photos you choose and do things in the app for you after you tap Apply. Here’s what it sends, so you can agree again.';
export const aiConsentPoints=[
 'Ask BAK builds each answer from your exact bike’s published specs, your Garage and BAK’s own tuning rules and safety checks.',
 'To write the answer, BAK shares your question, this conversation, any photo you attach, your bike details and setup log, and pages from manuals you uploaded with a third-party AI service (named in our Privacy Policy). A photo you choose to Action edit is sent to the same service to make the edit.',
 'Nothing BAK suggests in the app (a bike, an event, a post) happens until you tap Apply, and posts always wait for you to tap Post.',
 'BAK does not send your email address, password or payment details.',
];
export const aiConsentAgree='Agree and continue';
