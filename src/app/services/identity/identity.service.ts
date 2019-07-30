import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';

import { ModalController, Platform } from '@ionic/angular';
import {
  AuthMode,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';

import { User } from '../../models/user';
import { BrowserAuthPlugin } from '../browser-auth/browser-auth.plugin';
import { PinDialogComponent } from '../../pin-dialog/pin-dialog.component';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityService extends IonicIdentityVaultUser {
  private user: User;
  changed: Subject<User>;

  constructor(
    private browserAuthPlugin: BrowserAuthPlugin,
    private modalController: ModalController,
    private router: Router,
    private plt: Platform,
    private settings: SettingsService
  ) {
    super(plt, {
      restoreSessionOnReady: false,
      unlockOnReady: false,
      unlockOnAccess: true,
      lockAfter: 5000,
      hideScreenOnBackground: true
    });
  }

  get(): Observable<User> {
    return of(this.user);
  }

  async setDesiredAuthMode() {
    // This is just one sample login workflow. It mostly respects the settigs
    // that were last saved with the exception that it uses "Biometrics OR Passcode"
    // in the case were both were saved and the user logged out.
    const mode = (await this.useBiometrics())
      ? AuthMode.BiometricOnly
      : (await this.settings.usePasscode())
      ? AuthMode.PasscodeOnly
      : (await this.settings.useSecureStorageMode())
      ? AuthMode.SecureStorage
      : AuthMode.InMemoryOnly;
    return this.setAuthMode(mode);
  }

  async set(user: User): Promise<void> {
    this.user = user;
    this.changed.next(this.user);
  }

  private async useBiometrics(): Promise<boolean> {
    const use = await Promise.all([this.settings.useBiometrics(), this.isBiometricsAvailable()]);
    return use[0] && use[1];
  }

  async remove(): Promise<void> {
    await this.logout();
    this.user = undefined;
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
