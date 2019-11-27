import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { AuthenticationService, IdentityService } from '@app/services';
import { AuthMode } from '@ionic-enterprise/identity-vault';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  errorMessage: string;

  loginType: string;
  displayVaultLogin: boolean;

  constructor(
    private authentication: AuthenticationService,
    private identity: IdentityService,
    private navController: NavController
  ) {}

  ionViewWillEnter() {
    try {
      this.initLoginType();
    } catch (e) {
      console.error('Unable to check token status', e);
    }
  }

  async unlockClicked() {
    const hasSession = await this.identity.hasStoredSession();

    if (hasSession) {
      await this.identity.unlock();
      if (await this.authentication.isAuthenticated()) {
        this.goToApp();
        return;
      }
    }

    alert('Unable to authenticate. Please log in again');
  }

  async signInClicked() {
    try {
      await this.authentication.login();
      this.errorMessage = '';
      this.navController.navigateRoot('/tabs/home');
    } catch (e) {
      this.errorMessage = e.message || 'Unknown login error';
      console.error(e);
    }
  }

  private goToApp() {
    this.navController.navigateRoot('/tabs/home');
  }

  private async initLoginType(): Promise<void> {
    if (await this.identity.hasStoredSession()) {
      const authMode = await this.identity.getAuthMode();
      switch (authMode) {
        case AuthMode.BiometricAndPasscode:
          this.displayVaultLogin = true;
          this.loginType = await this.translateBiometricType();
          this.loginType += ' (Passcode Fallback)';
          break;
        case AuthMode.BiometricOnly:
          this.displayVaultLogin = true;
          this.loginType = await this.translateBiometricType();
          break;
        case AuthMode.PasscodeOnly:
          this.displayVaultLogin = true;
          this.loginType = 'Passcode';
          break;
        case AuthMode.SecureStorage:
          this.loginType = 'Secure Storage';
          break;
      }
    } else {
      this.displayVaultLogin = false;
      this.loginType = '';
    }
  }

  private async translateBiometricType(): Promise<string> {
    const type = await this.identity.getBiometricType();
    switch (type) {
      case 'touchID':
        return 'TouchID';
      case 'faceID':
        return 'FaceID';
    }

    return type;
  }
}
