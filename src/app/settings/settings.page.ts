import { Component, OnInit } from '@angular/core';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { AuthenticationService, VaultService, SettingsService } from '@app/services';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss']
})
export class SettingsPage implements OnInit {
  useBiometrics: boolean;
  usePasscode: boolean;
  useSecureStorageMode: boolean;
  biometricType: string;

  constructor(
    private authentication: AuthenticationService,
    private vaultService: VaultService,
    private settings: SettingsService
  ) {}

  async ngOnInit() {
    await this.vaultService.ready();
    await this.setAuthModeFlags();
    const type = await this.vaultService.supportedBiometricTypes();
    this.biometricType = this.translateBiometricType(type);
  }

  async logout() {
    this.authentication.logout();
  }

  async authModeChanged() {
    this.forceConsistentModes();
    await this.storeAuthModeFlags();
    await this.vaultService.setDesiredAuthMode();
  }

  async lock() {
    await this.vaultService.lockOut();
  }

  private forceConsistentModes() {
    if (this.useSecureStorageMode) {
      this.useBiometrics = false;
      this.usePasscode = false;
    }
  }

  private async setAuthModeFlags() {
    this.usePasscode = await this.vaultService.isPasscodeEnabled();
    this.useBiometrics = await this.vaultService.isBiometricsEnabled();
    this.useSecureStorageMode = await this.vaultService.isSecureStorageModeEnabled();
    await this.storeAuthModeFlags();
  }

  private storeAuthModeFlags(): Promise<void> {
    return this.settings.store({
      useBiometrics: this.useBiometrics,
      usePasscode: this.usePasscode,
      useSecureStorageMode: this.useSecureStorageMode
    });
  }

  private translateBiometricType(type: string): string {
    switch (type) {
      case 'touchID':
        return 'TouchID';
      case 'faceID':
        return 'FaceID';
    }

    return type;
  }
}
