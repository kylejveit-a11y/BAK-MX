import test from 'node:test';
import assert from 'node:assert/strict';
import {planGroup,priceLine,sortPackages} from '../src/storePackages.ts';
const pkg=(identifier,product,period,title,price='$9.99')=>({identifier,product:{identifier:product,title,description:'',priceString:price,subscriptionPeriod:period}});
test('store offers are sorted by what the names say, never guessed',()=>{
 const all=[pkg('$rc_annual','bakmx_pro_yearly','P1Y','BAK Pro Yearly','$79.99'),pkg('$rc_monthly','bakmx_pro_monthly','P1M','BAK Pro'),pkg('premium_m','bakmx_premium_monthly','P1M','BAK Premium','$4.99'),pkg('pack50','bakmx_credits_50',null,'50 questions','$4.99'),pkg('mystery','com.example.plan','P1M','Mystery plan')];
 const g=sortPackages(all);
 assert.deepEqual(g.pro.map(p=>p.identifier),['$rc_annual','$rc_monthly']);
 assert.deepEqual(g.premium.map(p=>p.identifier),['premium_m']);
 assert.deepEqual(g.packs.map(p=>p.identifier),['pack50']);
 assert.deepEqual(g.other.map(p=>p.identifier),['mystery']);
 assert.equal(planGroup(pkg('x','bakmx.pro','P1M','Plan')),'pro');
 assert.equal(planGroup(pkg('x','something_premium_pro','P1M','Plan')),'premium');
});
test('the price line is the store string and the period in words',()=>{
 assert.equal(priceLine(pkg('a','p','P1Y','Pro','$79.99')),'$79.99 / year');
 assert.equal(priceLine(pkg('a','p','P1M','Pro','€9,99')),'€9,99 / month');
 assert.equal(priceLine(pkg('a','p',null,'Pack','$4.99')),'$4.99');
 assert.equal(priceLine(pkg('a','p','P2W','Pro','$1')),'$1 / P2W');
});
