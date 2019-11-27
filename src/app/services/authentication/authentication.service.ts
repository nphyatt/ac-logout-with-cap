import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { IonicAuth } from '@ionic-enterprise/auth';

import { cordovaAzureConfig, webAzureConfig } from '@env/environment';
import { IdentityService } from '../identity/identity.service';
import { User } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends IonicAuth {
  private identity: IdentityService;
  private router: Router;

  // @ts-ignore
  constructor(identity: IdentityService, router: Router, platform: Platform) {
    const isCordovaApp = platform.is('cordova');
    const config = isCordovaApp ? cordovaAzureConfig : webAzureConfig;
    config.tokenStorageProvider = identity;
    super(config);
    this.identity = identity;
    this.router = router;
  }

  async login(): Promise<void> {
    await this.identity.logout();
    await this.identity.setDesiredAuthMode();

    try {
      await super.login();
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
    // you could also automatically attempt to unlock the vault if desired
    const isVaultLocked = await this.identity.isLocked();
    return !isVaultLocked && (await super.isAuthenticated());
  }

  async onLogout(): Promise<void> {
    await this.identity.logout();
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
