import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ModalController, Platform } from '@ionic/angular';
import { AuthMode, IonicIdentityVaultUser, IonicNativeAuthPlugin } from '@ionic-enterprise/identity-vault';

import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';
import { BrowserAuthPlugin } from '../browser-auth/browser-auth.plugin';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class VaultService extends IonicIdentityVaultUser<any> {
  constructor(
    private browserAuthPlugin: BrowserAuthPlugin,
    private modalController: ModalController,
    private router: Router,
    private plt: Platform,
    private settings: SettingsService
  ) {
    super(plt, {
      androidPromptTitle: 'Auth Connect w/ Identity Vault Demo',
      androidPromptSubtitle: 'Demo All the Things!',
      androidPromptDescription: 'You need to unlock me',
      restoreSessionOnReady: false,
      unlockOnReady: false,
      unlockOnAccess: true,
      lockAfter: 5000,
      hideScreenOnBackground: true,
      allowSystemPinFallback: true,
      shouldClearVaultAfterTooManyFailedAttempts: false
    });
  }

  async setDesiredAuthMode(): Promise<void> {
    const useBio = await this.useBiometrics();
    const usePasscode = await this.settings.usePasscode();
    const mode =
      useBio && usePasscode
        ? AuthMode.BiometricAndPasscode
        : useBio
        ? AuthMode.BiometricOnly
        : usePasscode
        ? AuthMode.PasscodeOnly
        : (await this.settings.useSecureStorageMode())
        ? AuthMode.SecureStorage
        : AuthMode.InMemoryOnly;
    return this.setAuthMode(mode);
  }

  private async useBiometrics(): Promise<boolean> {
    const use = await Promise.all([this.settings.useBiometrics(), this.isBiometricsAvailable()]);
    return use[0] && use[1];
  }

  async isLocked(): Promise<boolean> {
    const vault = await this.getVault();
    return vault.isLocked();
  }

  async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<string> {
    const dlg = await this.modalController.create({
      backdropDismiss: false,
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest
      }
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    return data || '';
  }

  onVaultLocked() {
    this.router.navigate(['login']);
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (this.plt.is('cordova')) {
      return super.getPlugin();
    }
    return this.browserAuthPlugin;
  }
}
