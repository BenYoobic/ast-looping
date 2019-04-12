# yoo-login

<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                       | Description | Type          | Default                                          |
| --------------------------- | ------------------------------- | ----------- | ------------- | ------------------------------------------------ |
| `backgroundColor`           | `background-color`              |             | `string`      | `'dark'`                                         |
| `backgroundSrc`             | `background-src`                |             | `string`      | `undefined`                                      |
| `currentLanguage`           | `current-language`              |             | `string`      | `undefined`                                      |
| `emailLabel`                | `email-label`                   |             | `string`      | `'EMAIL'`                                        |
| `error`                     | `error`                         |             | `string`      | `undefined`                                      |
| `forgotPasswordText`        | `forgot-password-text`          |             | `string`      | `'HELP'`                                         |
| `languages`                 | --                              |             | `ILanguage[]` | `undefined`                                      |
| `leftPanelFooterText`       | `left-panel-footer-text`        |             | `string`      | `'POWEREDBY'`                                    |
| `leftPanelMobileHeaderIcon` | `left-panel-mobile-header-icon` |             | `string`      | `'./assets/logo/operations_simple.svg'`          |
| `leftPanelWebHeaderIcon`    | `left-panel-web-header-icon`    |             | `string`      | `'./assets/logo/operations_landscape_light.svg'` |
| `loading`                   | `loading`                       |             | `boolean`     | `undefined`                                      |
| `loginButtonText`           | `login-button-text`             |             | `string`      | `'LOGIN'`                                        |
| `magicLinkButtonText`       | `magic-link-button-text`        |             | `string`      | `'MAGICLINK'`                                    |
| `passwordLabel`             | `password-label`                |             | `string`      | `'PASSWORD'`                                     |
| `rememberMeText`            | `remember-me-text`              |             | `string`      | `'REMEMBERME'`                                   |
| `resetPasswordButtonText`   | `reset-password-button-text`    |             | `string`      | `'RESETPASSWORD'`                                |
| `showRememberMe`            | `show-remember-me`              |             | `boolean`     | `false`                                          |
| `version`                   | `version`                       |             | `string`      | `undefined`                                      |
| `videoBackgroundUrl`        | `video-background-url`          |             | `string`      | `''`                                             |
| `videoHeaderIcon`           | `video-header-icon`             |             | `string`      | `undefined`                                      |
| `webLoginFormSubtitle`      | `web-login-form-subtitle`       |             | `string`      | `'LOGINSUBTITLE'`                                |
| `webLoginFormTitle`         | `web-login-form-title`          |             | `string`      | `''`                                             |
| `webSubtitleText`           | --                              |             | `string[]`    | `[]`                                             |
| `webTitleText`              | `web-title-text`                |             | `string`      | `'Operations'`                                   |


## Events

| Event                         | Description | Type                         |
| ----------------------------- | ----------- | ---------------------------- |
| `advancedLoginRequested`      |             | `CustomEvent<boolean>`       |
| `doLogin`                     |             | `CustomEvent<ILoginDetails>` |
| `languageSelectedParent`      |             | `CustomEvent<string>`        |
| `magicLinkModalRequested`     |             | `CustomEvent<boolean>`       |
| `passwordResetModalRequested` |             | `CustomEvent<boolean>`       |
| `rememberMeSelected`          |             | `CustomEvent<boolean>`       |


## Methods

### `setStatusBarColor(light: boolean) => void`



#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| `light` | `boolean` |             |

#### Returns

Type: `void`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
