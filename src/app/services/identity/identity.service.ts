import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ModalController, Platform } from '@ionic/angular';
import {
  AuthMode,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
  DefaultSession,
  VaultConfig,
  VaultError,
  VaultErrorCodes
} from '@ionic-enterprise/identity-vault';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user';
import { BrowserAuthPlugin } from '../browser-auth/browser-auth.plugin';
import { PinDialogComponent } from '../../pin-dialog/pin-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
  private user: User;

  changed: Subject<User>;

  constructor(
    private browserAuthPlugin: BrowserAuthPlugin,
    private http: HttpClient,
    private modalController: ModalController,
    private router: Router,
    private plt: Platform
  ) {
    super(plt, {
      authMode: AuthMode.BiometricAndPasscode,
      // authMode: AuthMode.BiometricOnly,
      // authMode: AuthMode.BiometricOrPasscode,
      restoreSessionOnReady: false,
      unlockOnReady: false,
      unlockOnAccess: true,
      lockAfter: 5000,
      hideScreenOnBackground: true
    });
    this.changed = new Subject();
  }

  get(): Observable<User> {
    if (!this.user) {
      return this.http
        .get<User>(`${environment.dataService}/users/current`)
        .pipe(tap(u => (this.user = u)));
    } else {
      return of(this.user);
    }
  }

  async set(user: User, token: string): Promise<void> {
    this.user = user;
    await this.login({ username: user.email, token: token });
    this.changed.next(this.user);
  }

  async remove(): Promise<void> {
    await this.logout();
    this.user = undefined;
    this.changed.next(this.user);
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      await this.restoreSession();
    }
    return this.token;
  }

  async restoreSession(): Promise<DefaultSession> {
    try {
      return await super.restoreSession();
    } catch (error) {
      if (error.code === VaultErrorCodes.VaultLocked) {
        console.log('working around the valut locked issue');
        const vault = await this.getVault();
        await vault.clear();
      }
    }
  }

  onSessionRestored(session: DefaultSession) {
    console.log('Session Restored: ', session);
  }

  onSetupError(error: VaultError): void {
    console.error('Get error during setup', error);
  }

  onConfigChange(config: VaultConfig): void {
    console.log('Got a config update: ', config);
  }

  onVaultReady(config: VaultConfig): void {
    console.log('The service is ready with config: ', config);
  }

  onVaultUnlocked(config: VaultConfig): void {
    console.log('The vault was unlocked with config: ', config);
  }

  async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<string> {
    const dlg = await this.modalController.create({
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest
      }
    });
    dlg.present();
    const value = await dlg.onDidDismiss();
    return Promise.resolve(value.data);
  }

  onVaultLocked() {
    console.log('Vault Locked');
    this.router.navigate(['login']);
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (this.plt.is('cordova')) {
      return super.getPlugin();
    }
    return this.browserAuthPlugin;
  }
}
