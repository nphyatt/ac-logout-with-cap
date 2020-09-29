# Ionic Customer Success Demo - Auth Connect with Identity Vault

This application shows the use of Ionic's Auth Connect solution to perform an OAuth login and Ionic's Identity Vault solution to store the resulting authentication tokens. This application is configured to work both in a browser and in a hybrid native application. We assume that you have access to Ioinic's Auth Connect and Identity Vault products. If this is not the case, please contact our sales department.

## Building

1. clone this repo
1. install your own `.npmrc` file from one of your production projects
1. `npm i`
1. `npm run build`
1. `npx cap sync`
1. `npx cap update` (only required after initial cloning of repo or when updating plugins)
1. `npx cap open ios` - to open Xcode in order to build and run on an iOS device
1. `npx cap open android` - to open Android Studio in order to build and run on an Android device

The application can be run in the browser via `npm start`.

You can register a user for yourself in our Microsoft AD B2C instance and login with it.

We use an an API hosted in heroku to verify the JWT from our Azure AD B2C instance before returning the tea categories.

It is also possible to use a local API. See the `src/environments/environment.ts` file for details.
When doing so, the [CS Demo API](https://github.com/ionic-team/cs-demo-api) will need to be running locally.

## Significant Architecture

### Authentication Service

The `AuthentationService` handles the login and logout protocols for integrating with Azure, Cognito, Auth0, etc. including opening the webviews, and storing and fetching the tokens. You can determine the type of storage provider to use IdentityVault, LocalStorage, or a custom TokenStorageProvider implementation.

This service extends Auth Connect's `IonicAuth` class, adding the minimal functionality required by the application. The base class manages all of the authentication keys, one of which generally include an ID token that defines the current user, an access token that determines the current access, and a refresh token which is used to refresh the access token as needed.

### Vault Service

The `VaultService` is the service that allows Auth Connect to store the authentication tokens. In this case we are using Identity Vault as the storage mechanism. You could also create your own storage service. Auth Connect contains a TokenStorageProvider interface that you can use to create your own storage service if you would like to. However, we suggest keeping things simple by using Identity Vault.

Refer to the [CS Identity Vault Demo](https://github.com/ionic-team/cs-demo-iv) for more details on using Identity Vault.

### HTTP Interceptors

There are two of these, `AuthInterceptor` and `UnauthInterceptor`.

The `UnauthInterceptor` redirects the user to the login page if there is a 401 error.

The `AuthInterceptor` gets the access token from the `AuthentationService` and adds it to the outgoing request as a bearer token. If the current access token is expired, the `AuthentationService` will automatically try to refresh the token.

### Authentication Guard

This guard checks with the `AuthenticationService` to determine if the user is currently authenticated. A part of this workflow will check to see that the current access token is valid, and if not will attempt to refresh it.

The guard is added to the routes that require the user to be authenticated.
