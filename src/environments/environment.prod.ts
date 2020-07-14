import { IonicAuthOptions } from '@ionic-enterprise/auth';

export const cordovaAzureConfig: IonicAuthOptions = {
  clientID: 'b69e2ee7-b67a-4e26-8a38-f7ca30d2e4d4',
  redirectUri: 'myapp://callback',
  scope:
    'openid offline_access email profile https://vikingsquad.onmicrosoft.com/api/Hello.Read',
  discoveryUrl:
    'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_Signup_Signin',
  audience: 'https://api.myapp.com',
  logoutUrl: 'myapp://callback?logout=true',
  platform: 'cordova',
  iosWebView: 'private',
  authConfig: 'azure',
  androidToolbarColor: 'Red',
};

export const webAzureConfig: IonicAuthOptions = {
  clientID: 'b69e2ee7-b67a-4e26-8a38-f7ca30d2e4d4',
  redirectUri: 'http://localhost:8100/login',
  scope:
    'openid offline_access email profile https://vikingsquad.onmicrosoft.com/api/Hello.Read',
  discoveryUrl:
    'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_Signup_Signin',
  audience: 'https://api.myapp.com',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web',
  authConfig: 'azure',
};

export const environment = {
  production: true,
  dataService: 'https://cs-demo-api.herokuapp.com',
};
