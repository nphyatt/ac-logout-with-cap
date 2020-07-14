import { Subject } from 'rxjs';

export function createVaultServiceMock() {
  const vault = jasmine.createSpyObj('VaultService', {
    getAuthMode: Promise.resolve(),
    supportedBiometricTypes: Promise.resolve(''),
    hasStoredSession: Promise.resolve(false),
    isBiometricsAvailable: Promise.resolve(false),
    isBiometricsEnabled: Promise.resolve(false),
    isLocked: Promise.resolve(false),
    isPasscodeEnabled: Promise.resolve(false),
    isSecureStorageModeEnabled: Promise.resolve(false),
    lockout: Promise.resolve(),
    logout: Promise.resolve(),
    onPasscodeRequest: Promise.resolve(),
    onVaultLocked: undefined,
    ready: Promise.resolve(),
    setAuthMode: Promise.resolve(),
    setDesiredAuthMode: Promise.resolve(),
    unlock: Promise.resolve(),
  });
  vault.lockChanged = new Subject();
  return vault;
}
