import { Component } from '@angular/core';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { AuthenticationService, VaultService } from '@app/services';
import { User } from '@app/models';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage {
  user: User;
  authMode: string;
  bioType: string;

  constructor(
    private authentication: AuthenticationService,
    private vault: VaultService,
  ) {}

  getUserInfo() {
    if (this.user === undefined) {
      return 'user is undefined.';
    } else {
      return `Email: ${this.user.email} UserID: ${this.user.id}`;
    }
  }

  async ionViewDidEnter() {
    this.user = await this.authentication.getUserInfo();
    this.authMode = AuthMode[await this.vault.getAuthMode()];
    this.bioType = await this.vault.getBiometricType();
  }

  logout() {
    this.authentication.logout();
  }
}
