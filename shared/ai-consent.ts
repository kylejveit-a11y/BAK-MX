/** Ask BAK sends the rider's question and bike details to a third-party AI provider to write the answer. Apple's guideline
 *  5.1.2(i) requires telling the rider that, and getting permission, before the first question. Same text on web and iPhone. */
export const AI_CONSENT_VERSION='v1';
export const aiConsentKey=(userId:string)=>`bakmx:ai-consent:${AI_CONSENT_VERSION}:${userId}`;
export const aiConsentTitle='Before your first question';
export const aiConsentPoints=[
 'Ask BAK uses an AI service from OpenAI to write answers.',
 'To answer, BAK sends OpenAI your question, this conversation, and the bike details in your Garage: model and year, parts and settings, and your setup log.',
 'BAK does not send your email address, password or payment details.',
];
export const aiConsentAgree='Agree and continue';
