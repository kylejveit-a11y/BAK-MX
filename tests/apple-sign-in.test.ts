import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,createVerify} from 'node:crypto';
import {appleClientSecret,appleKey,appleRevocationConfigured,APPLE_CLIENT_ID} from '../server/apple-sign-in.ts';

const pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const pem=pair.privateKey.export({type:'pkcs8',format:'pem'}) as string;

test('apple key reads the environment, unwraps one-line keys, and is absent until set',()=>{
 assert.equal(appleKey({} as NodeJS.ProcessEnv),null);
 assert.equal(appleRevocationConfigured({APPLE_SIGN_IN_KEY_ID:'ABC'} as NodeJS.ProcessEnv),false);
 const k=appleKey({APPLE_SIGN_IN_KEY_ID:' ABC123 ',APPLE_SIGN_IN_PRIVATE_KEY:pem.replace(/\n/g,'\\n')} as NodeJS.ProcessEnv)!;
 assert.equal(k.keyId,'ABC123');assert.equal(k.clientId,APPLE_CLIENT_ID);assert.equal(k.teamId,'PT6ZAQV9GY');
 assert.equal(k.privateKey,pem);
});

test('client secret is an ES256 JWT Apple will accept',()=>{
 const k={keyId:'K1',teamId:'T1',privateKey:pem,clientId:'com.bakmx.app'};
 const jwt=appleClientSecret(k,1_700_000_000,600);
 const [h,c,sig]=jwt.split('.');
 assert.deepEqual(JSON.parse(Buffer.from(h,'base64url').toString()),{alg:'ES256',kid:'K1',typ:'JWT'});
 assert.deepEqual(JSON.parse(Buffer.from(c,'base64url').toString()),{iss:'T1',iat:1_700_000_000,exp:1_700_000_600,aud:'https://appleid.apple.com',sub:'com.bakmx.app'});
 assert.equal(Buffer.from(sig,'base64url').length,64,'raw r||s signature, not DER');
 const v=createVerify('SHA256');v.update(`${h}.${c}`);
 assert.ok(v.verify({key:pair.publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(sig,'base64url')));
});
