import { storiesOf } from '@storybook/html';

import markdown from './readme.md';

storiesOf('App', module)
    .add('about', () => {
        let app = document.createElement('yoo-app');
        let about = document.createElement('yoo-about');
        app.appendChild(about);
        about.logo = './assets/app/logo/operations_simple.svg';
        about.version = '1.0.0';
        about.app = 'My App';
        return app;
    }, { notes: { markdown } })
    .add('about - HTML', () => `
    <yoo-app>
        <yoo-about
            logo="./assets/app/logo/operations_simple.svg" 
            version="1.0.0" 
            app="YOBI Design System">
        </yoo-about>
    </yoo-app>`
        , { notes: { markdown } });
