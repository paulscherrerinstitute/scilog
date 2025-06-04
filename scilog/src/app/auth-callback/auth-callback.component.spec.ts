import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthCallbackComponent } from './auth-callback.component';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
    standalone: false
})
class DummyComponent {}

describe('AuthCallbackComponent', () => {
  let component: AuthCallbackComponent;
  let fixture: ComponentFixture<AuthCallbackComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AuthCallbackComponent],
    providers: [
        provideRouter([
            { path: 'overview', component: DummyComponent },
            { path: 'auth-callback', component: AuthCallbackComponent },
            { path: 'dashboard', component: DummyComponent },
        ]),
    ],
}).compileComponents();

    fixture = TestBed.createComponent(AuthCallbackComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set scicat token and redirect to returnUrl', async () => {
    const routerSpy = spyOn(router, 'navigateByUrl').and.callThrough();
    await router.navigateByUrl(
      '/auth-callback?access-token=123&returnUrl=/dashboard'
    );
    fixture.detectChanges();
    expect(localStorage.getItem('scicat_token')).toEqual('123');
    expect(routerSpy).toHaveBeenCalledWith('/dashboard');
    localStorage.removeItem('scicat_token');
  });

  it('should should redirect to overview if no returnUrl', async () => {
    const routerSpy = spyOn(router, 'navigate').and.callThrough();
    await router.navigateByUrl('/auth-callback?access-token=123');
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/overview']);
  });
});
