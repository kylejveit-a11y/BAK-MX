/** Ask BAK sends the rider's question and bike details to a third-party AI provider to write the answer. Apple's guideline
 *  5.1.2(i) requires telling the rider that, and getting permission, before the first question. Same text on web and iPhone. */
export const AI_CONSENT_VERSION='v2';
export const aiConsentKey=(userId:string)=>`bakmx:ai-consent:${AI_CONSENT_VERSION}:${userId}`;
export const aiConsentTitle='Before your first question';
/** Riders who agreed to an earlier version see this instead: what changed, then the same points. */
export const AI_CONSENT_PREVIOUS=['v1'];
export const aiConsentUpdatedTitle='Ask BAK has been updated';
export const aiConsentUpdatedIntro='It can now read photos you attach and manual pages you upload for your bike. Here’s what it sends, so you can agree again.';
export const aiConsentPoints=[
 'Ask BAK uses an AI service from OpenAI to write answers.',
 'To answer, BAK sends OpenAI your question, this conversation, any photo you attach, the bike details in your Garage (model and year, parts and settings, setup log) and pages from manuals you uploaded for that bike.',
 'BAK does not send your email address, password or payment details.',
];
export const aiConsentAgree='Agree and continue';
