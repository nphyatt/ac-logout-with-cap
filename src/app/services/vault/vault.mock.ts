export function createIdentityServiceMock() {
  return jasmine.createSpyObj('VaultService', {
    setDesiredAuthMode: Promise.resolve(),
    isLocked: Promise.resolve(false),
    onPasscodeRequest: Promise.resolve(),
    onVaultLocked: undefined
  });
}
