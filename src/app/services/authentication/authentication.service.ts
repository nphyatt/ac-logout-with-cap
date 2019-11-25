import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { IonicAuth, IonicAuthOptions } from '@ionic-enterprise/auth';

import { cordovaAzureConfig, webAzureConfig } from '../../../environments/environment';
import { IdentityService } from '../identity';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends IonicAuth {
  private user: User;
  private identity: IdentityService;
  private router: Router;

  // @ts-ignore
  constructor(identity: IdentityService, router: Router, plt: Platform) {
    const isCordovaApp = plt.is('cordova');
    const config = isCordovaApp ? cordovaAzureConfig : webAzureConfig;
    config.tokenStorageProvider = identity;
    super(config);
    this.identity = identity;
    this.router = router;
    this.identity.get().subscribe(u => (this.user = u));
  }

  async login() {
    // logout to clear previously stored identity before new login
    await this.identity.remove();

    // set the desired auth mode
    await this.identity.setDesiredAuthMode();

    // login with auth service
    try {
      await super.login();
    } catch (err) {
      // This is to handle the password reset case for Azure AD
      //  This only applicable to Azure AD.
      console.log('login error: ' + JSON.stringify(err));
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

  async isAuthenticated() {
    // Check that the vault is unlocked before checking if the user is authenticated
    // you could also automatically attempt to unlock the vault if desired
    const isVaultLocked = await this.identity.isLocked();
    const isAuthed = !isVaultLocked && (await super.isAuthenticated());
    if (isAuthed && this.user === undefined) {
      // if the user is authed but we've there is not identity restore it
      this.identity.set(await this.getUserInfo());
    }
    return isAuthed;
  }

  async onLoginSuccess(response: any) {
    // grab the info about the user from tokens
    const userInfo = await this.getUserInfo();

    // set the user identity
    await this.identity.set(userInfo);
  }

  async onLogout() {
    await this.identity.remove();
    this.router.navigate(['login']);
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
