import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { Platform, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { createOverlayControllerMock, createPlatformMock, createRouterMock, createStorageMock } from '@test/mocks';
import { BrowserAuthPlugin, BrowserAuthService, IdentityService, SettingsService } from '@app/services';
import { createSettingsServiceMock } from '@app/services/mocks';

describe('IdentityService', () => {
  let httpTestingController: HttpTestingController;
  let identity: IdentityService;

  beforeAll(() => {
    (window as any).IonicNativeAuth = new BrowserAuthPlugin(new BrowserAuthService(createStorageMock()));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IdentityService,
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('Modal')
        },
        { provide: Platform, useFactory: createPlatformMock },
        { provide: Router, useFactory: createRouterMock },
        { provide: SettingsService, useFactory: createSettingsServiceMock },
        { provide: Storage, useFactory: createStorageMock }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
  });

  beforeEach(inject([IdentityService], (service: IdentityService) => {
    identity = service;
  }));

  it('injects', () => {
    expect(identity).toBeTruthy();
  });

  describe('on vault locked', () => {
    it('navigates to the login page', () => {
      const router = TestBed.get(Router);
      identity.onVaultLocked();
      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });
  });
});
