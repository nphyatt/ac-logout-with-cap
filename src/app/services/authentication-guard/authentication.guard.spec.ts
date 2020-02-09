import { TestBed, inject } from '@angular/core/testing';
import { NavController } from '@ionic/angular';

import { AuthGuard } from './authentication.guard';
import { AuthenticationService } from '@app/services';
import { createAuthenticationServiceMock } from '@app/services/mocks';
import { createNavControllerMock } from '@test/mocks';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthenticationService, useFactory: createAuthenticationServiceMock },
        { provide: NavController, useFactory: createNavControllerMock }
      ]
    });
  });

  it('exists', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

  describe('canActivate', () => {
    let guard: AuthGuard;
    let authenticationService;
    beforeEach(() => {
      guard = TestBed.inject(AuthGuard);
      authenticationService = TestBed.inject(AuthenticationService);
    });

    describe('when the user is authenticated', () => {
      beforeEach(() => {
        authenticationService.isAuthenticated.and.returnValue(Promise.resolve(true));
      });

      it('resolves to true', async () => {
        expect(await guard.canActivate()).toEqual(true);
      });

      it('does not navigate', async () => {
        const navController = TestBed.inject(NavController);
        await guard.canActivate();
        expect(navController.navigateRoot).not.toHaveBeenCalled();
      });
    });

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        authenticationService.isAuthenticated.and.returnValue(Promise.resolve(false));
      });

      it('resolves to false', async () => {
        expect(await guard.canActivate()).toEqual(false);
      });

      it('navigates to login', async () => {
        const navController = TestBed.inject(NavController);
        await guard.canActivate();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith('/login');
      });
    });
  });
});
