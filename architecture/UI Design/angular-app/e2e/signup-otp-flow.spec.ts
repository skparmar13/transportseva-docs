import {expect,test,type BrowserContext} from '@playwright/test';
test.use({trace:'off',video:'off',actionTimeout:20_000});test.setTimeout(180_000);
const checked=expect.configure({timeout:60_000});
async function localReads(context:BrowserContext){
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(r.method()+' '+u.pathname);return route.abort();}return route.continue();});return blocked;
}
test('invalid OTP links and malformed signup storage show real restart/recovery routes without verification calls',async({page,context})=>{
  const blocked=await localReads(context);let calls=0;page.on('request',r=>{if(/signup\/(request|verify)-otp/.test(r.url()))calls++;});
  await page.goto('/auth/otp-verification?next=reset');await expect(page.locator('vite-error-overlay')).toHaveCount(0);const view=page.locator('app-otp-verification');await expect(view.getByRole('alert')).toContainText('verification link is incomplete');await expect(view.locator('form')).toHaveCount(0);
  await page.evaluate(()=>sessionStorage.setItem('transportseva.pending_signup','malformed'));await page.goto('/auth/otp-verification?next=signup');await expect(view.getByRole('alert')).toBeVisible();
  await expect(view.getByRole('link',{name:'Start signup again',exact:true})).toHaveAttribute('href','/auth/signup');await view.getByRole('link',{name:'Password recovery',exact:true}).click();await expect(page).toHaveURL('/auth/forgot-password');
  expect(calls).toBe(0);expect(blocked).toEqual([]);
});
test('visible OTP countdown, busy actions, rejected-code retry and profile redirect using an existing real session',async({page,context},info)=>{
  const blocked=await localReads(context);await page.goto('/auth/login');await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill('verify-truck-owner-1793028294862-62@transportseva.test');await page.locator('input[name=password]').fill('TransportSevaE2E@2026');
  const [response]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/auth/login')&&r.request().method()==='POST'),page.getByRole('button',{name:/^Log In$/i}).click()]);expect(response.status()).toBe(200);const session=(await response.json()).data;
  await checked(page).toHaveURL('/truck-owner/dashboard');const mobile=String(session.user.phone).replace(/\D/g,'').slice(-10);expect(mobile).toMatch(/^[6-9]\d{9}$/);
  const clockStart=Date.now();await page.clock.setFixedTime(new Date(clockStart));await page.evaluate(mobile=>{sessionStorage.setItem('transportseva.pending_signup',JSON.stringify({mobile,role:'truck-owner'}));sessionStorage.setItem('transportseva.debug_otp','111111');sessionStorage.setItem('transportseva.signup_otp_cooldown',JSON.stringify({phone:'+91'+mobile,until:Date.now()+60_000}));},mobile);
  let releaseResend!:()=>void;const resendGate=new Promise<void>(resolve=>releaseResend=resolve);let resends=0;let verifies=0;let releaseVerify!:()=>void;const verifyGate=new Promise<void>(resolve=>releaseVerify=resolve);
  await page.route('**/api/auth/signup/request-otp',async route=>{resends++;expect(route.request().postDataJSON()).toEqual({phone:'+91'+mobile});await resendGate;return route.fulfill({json:{success:true,data:{debug_otp:'654321'}}});});
  await page.route('**/api/auth/signup/verify-otp',async route=>{verifies++;if(verifies===1)return route.fulfill({status:422,json:{success:false,message:'Invalid or expired OTP'}});expect(route.request().postDataJSON()).toEqual({phone:'+91'+mobile,otp:'654321',role:'truck-owner'});await verifyGate;return route.fulfill({json:{success:true,data:session}});});
  await page.goto('/auth/otp-verification?next=signup');const view=page.locator('app-otp-verification');const resend=view.locator('button.link-button');const verify=view.locator('button[type=submit]');
  await expect(view).toContainText('Request another code in');await expect(resend).toBeDisabled();await page.reload();await expect(resend).toBeDisabled();await page.clock.setFixedTime(new Date(clockStart+61_000));await expect(resend).toBeEnabled();
  for(let i=0;i<6;i++)await view.locator('input.otp-box').nth(i).fill('1');await resend.click();await expect(view.locator('.otp-spinner')).toBeVisible();await expect(resend).toBeDisabled();await expect(verify).toBeDisabled();releaseResend();
  await expect(view).toContainText('No message was sent');await expect(view.locator('input.otp-box').first()).toHaveValue('');await expect(resend).toBeDisabled();
  for(let i=0;i<6;i++)await view.locator('input.otp-box').nth(i).fill('1');await verify.click();await expect(view.getByRole('alert')).toHaveText('Invalid or expired OTP');
  for(const [i,digit]of Array.from('654321').entries())await view.locator('input.otp-box').nth(i).fill(digit);await verify.click();await expect(view.locator('.otp-spinner')).toBeVisible();await expect(verify).toBeDisabled();await expect(resend).toBeDisabled();releaseVerify();
  await checked(page).toHaveURL('/truck-owner/profile');await checked(page.locator('app-account-profile-page')).toBeVisible();expect(resends).toBe(1);expect(verifies).toBe(2);expect(blocked).toEqual([]);
  await info.attach('otp-browser-scope.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:'verify-truck-owner-1793028294862-62@transportseva.test',otpResponses:'Controlled responses; verification returns the existing real login session. No OTP was sent or newly verified against the main backend.',resends,verifies,destination:'/truck-owner/profile',blockedBusinessWrites:blocked}))});
});
