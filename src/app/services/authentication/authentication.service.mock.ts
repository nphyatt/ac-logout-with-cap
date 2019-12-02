import { of } from 'rxjs';

export function createAuthenticationServiceMock() {
  return jasmine.createSpyObj('AuthenticationService', {
    login: Promise.resolve(),
    isAuthenticated: Promise.resolve(false),
    onLogout: Promise.resolve(),
    getUserInfo: Promise.resolve()
  });
}
