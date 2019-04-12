import { storiesOf } from '@storybook/html';

import markdown from './readme.md';

storiesOf('App', module)
    .add('login', () => {
        let login = document.createElement('yoo-login');
        login.leftPanelMobileHeaderIcon = './assets/app/logo/operations_simple.svg';
        login.leftPanelWebHeaderIcon = './assets/operations/shared/logo/operations_landscape_light.svg';
        login.webTitleText = 'Welcome';
        login.webLoginFormTitle = 'Welcome';
        login.webLoginFormSubtitle = 'Please log in'
        return login;
    }, { notes: { markdown } })
    .add('login - HTML', () => `
    <yoo-app>    
        <yoo-login 
            left-panel-mobile-header-icon="./assets/app/logo/operations_simple.svg"
            left-panel-web-header-icon="./assets/operations/shared/logo/operations_landscape_light.svg"
            button-class="success"
            web-title-text="Welcome"
            web-login-form-title="Welcome"
            web-login-form-subtitle="Please log in">
        </yoo-login>
    </yoo-app>`);