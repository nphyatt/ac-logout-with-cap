import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { AuthenticationService, VaultService } from '@app/services';
import { createVaultServiceMock, createAuthenticationServiceMock } from '@app/services/mocks';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let authentication;
  let vaultService;

  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async(() => {
    authentication = createAuthenticationServiceMock();
    vaultService = createVaultServiceMock();
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [FormsModule, IonicModule],
      providers: [
        { provide: AuthenticationService, useValue: authentication },
        { provide: VaultService, useValue: vaultService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('on view enter', () => {
    describe('with biometrics enabled', () => {
      beforeEach(() => {
        vaultService.isBiometricsEnabled.and.returnValue(Promise.resolve(true));
        vaultService.getAuthMode.and.returnValue(Promise.resolve(AuthMode.BiometricOnly));
      });

      describe('with a stored token', () => {
        beforeEach(() => {
          vaultService.hasStoredSession.and.returnValue(Promise.resolve(true));
        });

        it('gets the biometric type', fakeAsync(() => {
          vaultService.isBiometricsAvailable.and.returnValue(Promise.resolve(true));
          vaultService.getBiometricType.and.returnValue(Promise.resolve('blood'));
          component.ionViewWillEnter();
          tick();
          expect(component.loginType).toEqual('blood');
        }));
      });

      describe('without a stored token', () => {
        beforeEach(() => {
          vaultService.hasStoredSession.and.returnValue(Promise.resolve(false));
        });

        it('does not get the biometric type', fakeAsync(() => {
          vaultService.getBiometricType.and.returnValue(Promise.resolve('blood'));
          component.ionViewWillEnter();
          tick();
          expect(vaultService.getBiometricType).not.toHaveBeenCalled();
          expect(component.loginType).toEqual('');
        }));
      });
    });
  });

  describe('clicking the unlock button', () => {
    it('determines if the user has a stored session', async () => {
      await component.unlockClicked();
      expect(vaultService.hasStoredSession).toHaveBeenCalledTimes(1);
    });
  });
});
