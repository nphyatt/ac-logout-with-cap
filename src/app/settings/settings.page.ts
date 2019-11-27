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
    private vault: VaultService,
    private settings: SettingsService
  ) {}

  async ngOnInit() {
    await this.vault.ready();
    await this.setAuthModeFlags();
    const type = await this.vault.getBiometricType();
    this.biometricType = this.translateBiometricType(type);
  }

  async logout() {
    this.authentication.logout();
  }

  async authModeChanged() {
    if (this.useSecureStorageMode) {
      await this.vault.setAuthMode(AuthMode.SecureStorage);
    } else if (this.useBiometrics && this.usePasscode) {
      await this.vault.setAuthMode(AuthMode.BiometricAndPasscode);
    } else if (this.useBiometrics && !this.usePasscode) {
      await this.vault.setAuthMode(AuthMode.BiometricOnly);
    } else if (this.usePasscode && !this.useBiometrics) {
      await this.vault.setAuthMode(AuthMode.PasscodeOnly);
    } else {
      await this.vault.setAuthMode(AuthMode.InMemoryOnly);
    }
    await this.setAuthModeFlags();
  }

  async lock() {
    await this.vault.lockOut();
  }

  private async setAuthModeFlags() {
    this.usePasscode = await this.vault.isPasscodeEnabled();
    this.useBiometrics = await this.vault.isBiometricsEnabled();
    this.useSecureStorageMode = await this.vault.isSecureStorageModeEnabled();

    this.settings.store({
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
