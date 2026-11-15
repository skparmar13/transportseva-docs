import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { defer, firstValueFrom, of, Subject, throwError } from 'rxjs';
import { ApiAuthService, BackendLoginUser } from '../api/api-auth.service';
import { PortalSessionCheckService } from './portal-session-check.service';

describe('Navigation-scoped server identity check', () => {
  const user: BackendLoginUser = {uuid:'owner',email:'owner@example.test',full_name:'Owner',role:'truck-owner'};
  let api: jasmine.SpyObj<ApiAuthService>;let events: Subject<any>;let navigation: number;
  beforeEach(() => {
    navigation=1;events=new Subject();localStorage.setItem('transportseva.access_token','session-one');
    api=jasmine.createSpyObj('ApiAuthService',['me']);api.me.and.returnValue(of(user));
    TestBed.configureTestingModule({providers:[{provide:ApiAuthService,useValue:api},{provide:Router,useValue:{events,getCurrentNavigation:()=>({id:navigation})}}]});
  });
  afterEach(()=>localStorage.removeItem('transportseva.access_token'));
  it('shares parent and child guard verification but rechecks later navigations', async () => {
    let httpReads=0;api.me.and.returnValue(defer(()=>{httpReads++;return of(user);}));
    const service=TestBed.inject(PortalSessionCheckService);
    expect(await firstValueFrom(service.verify())).toEqual(user);
    expect(await firstValueFrom(service.verify())).toEqual(user);expect(api.me).toHaveBeenCalledTimes(1);expect(httpReads).toBe(1);
    events.next(new NavigationEnd(1,'/owner','/owner'));navigation=2;
    await firstValueFrom(service.verify());expect(api.me).toHaveBeenCalledTimes(2);
  });
  it('never shares a prior identity after a token change or cancelled navigation', async () => {
    const service=TestBed.inject(PortalSessionCheckService);await firstValueFrom(service.verify());
    localStorage.setItem('transportseva.access_token','session-two');await firstValueFrom(service.verify());
    events.next(new NavigationCancel(1,'/owner','cancelled'));await firstValueFrom(service.verify());
    expect(api.me).toHaveBeenCalledTimes(3);
  });
  it('allows a slow valid response after 15 seconds, with a 30 second deadline', fakeAsync(() => {
    const pending=new Subject<BackendLoginUser>();api.me.and.returnValue(pending);
    let result:any;TestBed.inject(PortalSessionCheckService).verify().subscribe({next:v=>result=v,error:e=>result=e});
    tick(16_000);expect(result).toBeUndefined();pending.next(user);expect(result).toEqual(user);
  }));
  it('fails closed on a stalled check and permits an independent retry', fakeAsync(() => {
    api.me.and.returnValue(new Subject());let failure:any;
    const service=TestBed.inject(PortalSessionCheckService);service.verify().subscribe({error:e=>failure=e});tick(30_001);
    expect(failure.name).toBe('TimeoutError');events.next(new NavigationCancel(1,'/owner','timeout'));navigation=2;
    api.me.and.returnValue(of(user));let result:any;service.verify().subscribe(v=>result=v);expect(result).toEqual(user);
  }));
  it('retries a transient read once but never retries confirmed denied access', fakeAsync(() => {
    let requests=0;api.me.and.returnValue(defer(()=>++requests===1?throwError(()=>new HttpErrorResponse({status:503})):of(user)));
    let result:any;const service=TestBed.inject(PortalSessionCheckService);service.verify().subscribe(v=>result=v);
    tick(251);expect(requests).toBe(2);expect(result).toEqual(user);
    navigation=2;let denied=0;api.me.and.returnValue(defer(()=>{denied++;return throwError(()=>new HttpErrorResponse({status:401}));}));
    service.verify().subscribe({error:()=>{}});tick(251);expect(denied).toBe(1);
  }));
});
