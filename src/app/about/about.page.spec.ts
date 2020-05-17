import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavController } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { AboutPage } from './about.page';
import { AuthenticationService, VaultService } from '@app/services';
import { createAuthenticationServiceMock, createVaultServiceMock } from '@app/services/mocks';
import { createNavControllerMock } from '@test/mocks';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AboutPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock
        },
        { provide: VaultService, useFactory: createVaultServiceMock },
        { provide: NavController, useFactory: createNavControllerMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('init', () => {
    it('gets the user', async () => {
      const auth = TestBed.inject(AuthenticationService);
      (auth as any).getUserInfo.and.returnValue(
        Promise.resolve({
          email: 'test@test.com',
          id: '42-73'
        })
      );
      expect(component.user).toBeFalsy();
      await component.ionViewDidEnter();
      expect(component.user).toEqual({
        email: 'test@test.com',
        id: '42-73'
      });
    });

    it('gets the auth mode', async () => {
      const vaultService = TestBed.inject(VaultService);
      (vaultService as any).getAuthMode.and.returnValue(Promise.resolve(AuthMode.InMemoryOnly));
      await component.ionViewDidEnter();
      expect(vaultService.getAuthMode).toHaveBeenCalledTimes(1);
      expect(component.authMode).toEqual('InMemoryOnly');
    });

    it('gets the auth mode', async () => {
      const vaultService = TestBed.inject(VaultService);
      (vaultService as any).getBiometricType.and.returnValue(Promise.resolve('FaceID'));
      await component.ionViewDidEnter();
      expect(vaultService.getBiometricType).toHaveBeenCalledTimes(1);
      expect(component.bioType).toEqual('FaceID');
    });
  });

  describe('logout', () => {
    it('calls the logout', () => {
      const auth = TestBed.inject(AuthenticationService);
      component.logout();
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });
  });
});
