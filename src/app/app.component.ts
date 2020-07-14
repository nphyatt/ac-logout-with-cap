import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { AuthenticationService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(
    private auth: AuthenticationService,
    private navController: NavController,
    private platform: Platform,
  ) {
    this.initializeApp();
    this.auth.changed.subscribe(authenticated =>
      this.handleAuthChange(authenticated),
    );
  }

  async initializeApp() {
    const { SplashScreen, StatusBar } = Plugins;
    if (this.platform.is('hybrid')) {
      await SplashScreen.hide();
      await StatusBar.setStyle({ style: StatusBarStyle.Light });
      if (this.platform.is('android')) {
        StatusBar.setBackgroundColor({ color: '#3171e0' });
      }
    }
  }

  private handleAuthChange(authenticated: boolean) {
    if (authenticated) {
      this.navController.navigateRoot(['tabs', 'home']);
    } else {
      this.navController.navigateRoot(['login']);
    }
  }
}
