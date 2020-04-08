import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { AuthenticationService, VaultService } from '@app/services';
import { AuthMode, VaultErrorCodes } from '@ionic-enterprise/identity-vault';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  errorMessage: string;

  loginType: string;

  constructor(
    private authentication: AuthenticationService,
    private vaultService: VaultService,
    private navController: NavController
  ) {}

  ionViewWillEnter() {
    try {
      this.setUnlockType();
    } catch (e) {
      console.error('Unable to check token status', e);
    }
  }

  async unlockClicked() {
    const hasSession = await this.vaultService.hasStoredSession();

    if (hasSession) {
      await this.tryUnlock();
      if (await this.authentication.isAuthenticated()) {
        this.goToApp();
        return;
      }
    }
  }

  async signInClicked() {
    try {
      await this.authentication.login();
      this.errorMessage = '';
      this.goToApp();
    } catch (e) {
      this.errorMessage = e.message || 'Unknown login error';
      console.error(e);
    }
  }

  private goToApp() {
    this.navController.navigateRoot('/tabs/home');
  }

  private async tryUnlock() {
    try {
      await this.vaultService.unlock();
    } catch (error) {
      alert('Unable to unlock the token');
      this.setUnlockType();
      if (error.code !== VaultErrorCodes.AuthFailed) {
        throw error;
      }
    }
  }

  private async setUnlockType(): Promise<void> {
    const previousLoginType = this.loginType;
    await this.determineLoginType();
    if (previousLoginType && !this.loginType) {
      alert('The vault is no longer accessible. Please login again');
    }
  }

  private async determineLoginType() {
    if (await this.vaultService.hasStoredSession()) {
      const authMode = await this.vaultService.getAuthMode();
      switch (authMode) {
        case AuthMode.BiometricAndPasscode:
          this.loginType = await this.translateBiometricType();
          this.loginType += ' (Passcode Fallback)';
          break;
        case AuthMode.BiometricOnly:
          const displayVaultLogin = await this.vaultService.isBiometricsAvailable();
          this.loginType = displayVaultLogin ? await this.translateBiometricType() : '';
          break;
        case AuthMode.PasscodeOnly:
          this.loginType = 'Passcode';
          break;
        case AuthMode.SecureStorage:
          this.loginType = 'Secure Storage';
          break;
      }
    } else {
      this.loginType = '';
    }
  }

  private async translateBiometricType(): Promise<string> {
    const type = await this.vaultService.getBiometricType();
    switch (type) {
      case 'touchID':
        return 'TouchID';
      case 'faceID':
        return 'FaceID';
    }

    return type;
  }
}
