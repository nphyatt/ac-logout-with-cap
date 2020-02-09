import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthMode } from '@ionic-enterprise/identity-vault';
import { Platform, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import {
  createOverlayControllerMock,
  createPlatformMock,
  createRouterMock,
  createStorageMock,
  createOverlayElementMock
} from '@test/mocks';
import { BrowserAuthService, VaultService, SettingsService } from '@app/services';
import { createSettingsServiceMock, createBrowserAuthServiceMock } from '@app/services/mocks';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';

describe('IdentityService', () => {
  let httpTestingController: HttpTestingController;
  let vaultService: VaultService;
  let vault;
  let modal;

  beforeEach(() => {
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VaultService,
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('Modal', modal)
        },
        { provide: BrowserAuthService, useFactory: createBrowserAuthServiceMock },
        { provide: Platform, useFactory: createPlatformMock },
        { provide: Router, useFactory: createRouterMock },
        { provide: SettingsService, useFactory: createSettingsServiceMock },
        { provide: Storage, useFactory: createStorageMock }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  beforeEach(inject([VaultService], (service: VaultService) => {
    vault = TestBed.inject(BrowserAuthService);
    vaultService = service;
  }));

  it('injects', () => {
    expect(vaultService).toBeTruthy();
  });

  describe('setDesiredAuthMode', () => {
    let settingsService;
    beforeEach(async () => {
      await vaultService.logout();
      settingsService = TestBed.inject(SettingsService);
    });

    it('sets bio only', async () => {
      settingsService.useBiometrics.and.returnValue(Promise.resolve(true));
      vault.isBiometricsAvailable.and.returnValue(Promise.resolve(true));
      await vaultService.setDesiredAuthMode();
      expect(vault.setBiometricsEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setBiometricsEnabled).toHaveBeenCalledWith(true);
      expect(vault.setPasscodeEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setPasscodeEnabled).toHaveBeenCalledWith(false);
    });

    it('sets passcode only', async () => {
      settingsService.usePasscode.and.returnValue(Promise.resolve(true));
      await vaultService.setDesiredAuthMode();
      expect(vault.setBiometricsEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setBiometricsEnabled).toHaveBeenCalledWith(false);
      expect(vault.setPasscodeEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setPasscodeEnabled).toHaveBeenCalledWith(true);
    });

    it('sets bio and passcode passcode only', async () => {
      settingsService.useBiometrics.and.returnValue(Promise.resolve(true));
      vault.isBiometricsAvailable.and.returnValue(Promise.resolve(true));
      settingsService.usePasscode.and.returnValue(Promise.resolve(true));
      await vaultService.setDesiredAuthMode();
      expect(vault.setBiometricsEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setBiometricsEnabled).toHaveBeenCalledWith(true);
      expect(vault.setPasscodeEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setPasscodeEnabled).toHaveBeenCalledWith(true);
    });

    it('sets secure storage mode', async () => {
      settingsService.useSecureStorageMode.and.returnValue(Promise.resolve(true));
      await vaultService.setDesiredAuthMode();
      expect(vault.setSecureStorageModeEnabled).toHaveBeenCalledTimes(1);
      expect(vault.setSecureStorageModeEnabled).toHaveBeenCalledWith(true);
    });
  });

  describe('isLocked', () => {
    it('returns the value from the vault', async () => {
      vault.isLocked.and.returnValue(Promise.resolve(false));
      expect(await vaultService.isLocked()).toEqual(false);
      vault.isLocked.and.returnValue(Promise.resolve(true));
      expect(await vaultService.isLocked()).toEqual(true);
    });
  });

  describe('onPasscodeRequest', () => {
    it('creates a PinDialogComponent modal', () => {
      const modalController = TestBed.inject(ModalController);
      vaultService.onPasscodeRequest(false);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        backdropDismiss: false,
        component: PinDialogComponent,
        componentProps: {
          setPasscodeMode: false
        }
      });
    });

    it('passes setPasscodeMode', () => {
      const modalController = TestBed.inject(ModalController);
      vaultService.onPasscodeRequest(true);
      expect(modalController.create).toHaveBeenCalledWith({
        backdropDismiss: false,
        component: PinDialogComponent,
        componentProps: {
          setPasscodeMode: true
        }
      });
    });

    it('presents the modal', async () => {
      await vaultService.onPasscodeRequest(true);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('returns the data from the modal', async () => {
      modal.onDidDismiss.and.returnValue(
        Promise.resolve({
          role: 'dismiss',
          data: 'thisisthePIN'
        })
      );
      expect(await vaultService.onPasscodeRequest(true)).toEqual('thisisthePIN');
    });

    it('returns an empty string if there is no data returned from the modal', async () => {
      expect(await vaultService.onPasscodeRequest(true)).toEqual('');
    });
  });

  describe('on vault locked', () => {
    it('navigates to the login page', () => {
      const router = TestBed.inject(Router);
      vaultService.onVaultLocked();
      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });
  });
});
