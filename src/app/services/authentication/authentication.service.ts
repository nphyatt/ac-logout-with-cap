import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonicAuth } from '@ionic-enterprise/auth';
import { Subject, Observable } from 'rxjs';

import { cordovaAzureConfig, webAzureConfig } from '@env/environment';
import { VaultService } from '../vault/vault.service';
import { User } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends IonicAuth {
  private vaultService: VaultService;

  private _changed: Subject<boolean>;
  get changed(): Observable<boolean> {
    return this._changed.asObservable();
  }

  // @ts-ignore
  constructor(vaultService: VaultService, platform: Platform) {
    const isCordovaApp = platform.is('cordova');
    const config = isCordovaApp ? cordovaAzureConfig : webAzureConfig;
    config.tokenStorageProvider = vaultService;
    super(config);
    this.vaultService = vaultService;
    this._changed = new Subject();
    vaultService.lockChanged.subscribe(locked => this._changed.next(!locked));
  }

  async login(): Promise<void> {
    await this.vaultService.logout();
    await this.vaultService.setDesiredAuthMode();

    try {
      await super.login();
      this._changed.next(true);
    } catch (err) {
      // This is to handle the password reset case for Azure AD
      //  This only applicable to Azure AD.
      console.log('login error:', +err);
      const message: string = err.message;
      // This is the error code returned by the Azure AD servers on failure.
      if (message !== undefined && message.startsWith('AADB2C90118')) {
        // The address you pass back is the custom user flow (policy) endpoint
        await super.login(
          'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_password_reset'
        );
      } else {
        throw new Error(err.error);
      }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const isVaultLocked = await this.vaultService.isLocked();
    return !isVaultLocked && (await super.isAuthenticated());
  }

  async onLogout(): Promise<void> {
    await this.vaultService.logout();
    this._changed.next(false);
  }

  async getUserInfo(): Promise<User | undefined> {
    const idToken = await this.getIdToken();
    if (!idToken) {
      return;
    }

    let email = idToken.email;
    if (idToken.emails instanceof Array) {
      email = idToken.emails[0];
    }

    return {
      id: idToken.sub,
      email: email,
      firstName: idToken.firstName,
      lastName: idToken.lastName
    };
  }
}
