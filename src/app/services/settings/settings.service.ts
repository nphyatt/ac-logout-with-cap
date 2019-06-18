import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private keys = {
    biometrics: 'useBiometrics',
    passcode: 'usePasscode',
    secureStorageMode: 'useSecureStorageMode'
  };

  constructor(private storage: Storage) {}

  async useBiometrics(): Promise<boolean> {
    const v = await this.storage.get(this.keys.biometrics);
    console.log('useBiometrics:', v);
    return v;
  }

  async usePasscode(): Promise<boolean> {
    const v = await this.storage.get(this.keys.passcode);
    console.log('usPasscode:', v);
    return v;
  }

  async useSecureStorageMode(): Promise<boolean> {
    const v = await this.storage.get(this.keys.secureStorageMode);
    console.log('useSecureStorage:', v);
    return v;
  }

  async store(settings: {
    useBiometrics: boolean;
    usePasscode: boolean;
    useSecureStorageMode: boolean;
  }) {
    console.log('store:', settings);
    if (settings.useBiometrics !== undefined) {
      this.storage.set(this.keys.biometrics, settings.useBiometrics);
    }
    if (settings.usePasscode !== undefined) {
      this.storage.set(this.keys.passcode, settings.usePasscode);
    }
    if (settings.useSecureStorageMode !== undefined) {
      this.storage.set(this.keys.secureStorageMode, settings.useSecureStorageMode);
    }
  }
}
