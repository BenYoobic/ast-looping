import { Component, Element, State, Prop, Event, EventEmitter, Watch, Method } from '@stencil/core';

import {
    ILanguage, ILoginDetails, getElementDimensions, showActionSheet, showModal, translate, isCordova, isIonic, isIphoneX, isIOS, isTablet,
    disableKeyboardResize, LoginFocusAnimation, enableKeyboardResize, querySelectorAllDeep, isAndroid, isIphone5, isIphoneSE, isDarkTheme, isWeb, CssClassMap, isSafari, debounce, querySelectorDeep
} from '../../../index';
import { StatusBar } from '@ionic-native/status-bar';
import { getAppContext } from '../../../utils';

const MIN_SCREEN_SIZE_LEFT_PANEL = 900;
const IPAD_MINI_SCREEN_HEIGHT = 1024;
const MINIMUM_SCREEN_SIZE_TO_SHOW_HEADER = 665;
declare var Keyboard: any;

@Component({
    tag: 'yoo-login',
    styleUrl: 'login.scss',
    shadow: true
})
export class YooLoginComponent {

    @Prop() leftPanelMobileHeaderIcon: string = './assets/logo/operations_simple.svg';
    @Prop() leftPanelWebHeaderIcon: string = './assets/logo/operations_landscape_light.svg';
    @Prop() videoBackgroundUrl: string = '';
    @Prop({ mutable: true }) videoHeaderIcon: string;
    @Prop() backgroundSrc: string;
    @Prop() backgroundColor: string = 'dark';
    @Prop({ mutable: true }) error: string;
    @Prop() loading: boolean;
    @Prop() leftPanelFooterText: string = 'POWEREDBY';
    @Prop() webTitleText: string = 'Operations';
    @Prop() webSubtitleText: string[] = [];
    @Prop() webLoginFormTitle: string = '';
    @Prop() webLoginFormSubtitle: string = 'LOGINSUBTITLE';
    @Prop() rememberMeText: string = 'REMEMBERME';
    @Prop() forgotPasswordText: string = 'HELP';
    @Prop() languages: ILanguage[];
    @Prop() currentLanguage: string;
    @Prop() emailLabel: string = 'EMAIL';
    @Prop() passwordLabel: string = 'PASSWORD';
    @Prop() magicLinkButtonText: string = 'MAGICLINK';
    @Prop() resetPasswordButtonText: string = 'RESETPASSWORD';
    @Prop() loginButtonText: string = 'LOGIN';
    @Prop() showRememberMe: boolean = false;
    @Prop() version: string;

    @Event() doLogin: EventEmitter<ILoginDetails>;
    @Event() languageSelectedParent: EventEmitter<string>;
    @Event() rememberMeSelected: EventEmitter<boolean>;
    @Event() passwordResetModalRequested: EventEmitter<boolean>;
    @Event() magicLinkModalRequested: EventEmitter<boolean>;
    @Event() advancedLoginRequested: EventEmitter<boolean>;

    @State() pageWidthSize: number;
    @State() language: string = 'EN';
    @State() passwordInputChanged: boolean = false;
    @State() inputFocused: boolean = false;
    @State() deviceInputFocused: boolean = false;
    @State() showSupport: boolean;
    @State() showLeftPanel: boolean = true;

    @Element() host: HTMLStencilElement;

    private rememberMe: boolean = false;
    private userEmail: string;
    private userPassword: string;
    private emailFocused: boolean = false;
    private passwordFocused: boolean = false;
    private fullWindowHeight: number = 0;
    private loginContainerMobileHeight: number = 0;
    private updateVideoSrcOnDidUpdate: boolean;
    private loginContainerMobile: HTMLElement;
    private loginVideoEl: HTMLVideoElement;
    private emailInputEl: HTMLYooFormInputElement;
    private passwordInputEl: HTMLYooFormInputElement;
    private loginBtnEl: HTMLYooButtonElement;
    private languageSelectorEl: HTMLDivElement;
    private spaceFillEl: HTMLDivElement;
    private videoHeaderContainerEl: HTMLDivElement;
    private resizeListener: any;
    private showHeaderFooterOnFocus: boolean = true;
    private focusAnimation: LoginFocusAnimation;
    private hideTitleAndFooterForIpadMini: boolean = false;
    private outerContainerElement: HTMLDivElement;
    private languageSelectorButtonElement: HTMLYooButtonElement;

    @Watch('showLeftPanel')
    onLeftPanelChanged(newValue: boolean) {
        if (newValue) {
            this.updateVideoSrcOnDidUpdate = true;
        }
    }

    @Method()
    setStatusBarColor(light: boolean) {
        if (light) {
            StatusBar.styleLightContent();
        } else {
            StatusBar.styleDefault();
        }
    }

    componentWillLoad() {
        if (isCordova()) {
            disableKeyboardResize(Keyboard);
            this.setStatusBarColor(true);
        }
    }

    componentDidLoad() {
        // Workaround for angular route bug 
        // where login through SSO and logout cause route to stop working
        if (isIOS() && document) {
            let oldMenuPage = querySelectorDeep(document as any, 'menu-page');
            if (oldMenuPage && oldMenuPage.remove) {
                oldMenuPage.remove();
            }
        }
        this.resizePage();
        this.resizeListener = debounce(this.resizePage, 500).bind(this);
        window.addEventListener('resize', this.resizeListener);
        // this.deviceHeight = window.innerHeight;
        this.resizeLanguageSelectorWidth();
        setTimeout(() => {
            if (isCordova() && this.loginContainerMobile) {
                this.loginContainerMobileHeight = getElementDimensions(this.loginContainerMobile).height;
                this.loginContainerMobile.setAttribute('style', `height: ${this.loginContainerMobileHeight}px;`);
            }
        }, 1000);

        if (this.videoHeaderContainerEl) {
            this.focusAnimation = new LoginFocusAnimation();
            this.focusAnimation.addContainer(this.videoHeaderContainerEl);
        }
        if (((isCordova() && isIOS()) || isSafari()) && this.outerContainerElement) {
            this.outerContainerElement.style.height = `${window.innerHeight}px`;
        }
    }

    componentDidUpdate() {
        this.resizeLanguageSelectorWidth();
        if (this.updateVideoSrcOnDidUpdate && this.loginVideoEl) {
            this.loginVideoEl.src = this.videoBackgroundUrl;
            this.loginVideoEl.play();
            this.updateVideoSrcOnDidUpdate = false;
        }
        
        if (((isCordova() && isIOS()) || isSafari()) && this.outerContainerElement) {
            this.outerContainerElement.style.height = `${window.innerHeight}px`;
        }
    }

    componentDidUnload() {
        window.removeEventListener('resize', this.resizeListener);
        if (isCordova()) {
            enableKeyboardResize(Keyboard);
            if (isIOS()) {
                this.setStatusBarColor(false);
            }
        }
    }

    hasVideoBackground() {
        return this.videoBackgroundUrl !== '';
    }

    hasLoginScreenClass() {
        return isDarkTheme();
    }

    onAlertClosed() {
        this.error = '';
    }

    onAlertActionSelected() {
        this.error = '';
        window.location.href = 'mailto:support@yoobic.com';
    }

    onRadioClicked(event) {
        event.detail === 'checked' ? this.rememberMe = true : this.rememberMe = false;
    }

    onInputChanged(ev: CustomEvent<string>, type: string) {
        this.validateLoginInputs();
        if (type === 'email') {
            this.userEmail = ev.detail;
        } else if (type === 'password') {
            this.userPassword = ev.detail;
        }
    }

    onAdvancedLogin() {
        this.advancedLoginRequested.emit(true);
    }

    onEnterPressed() {
        this.validateLoginInputs();
        this.onLogin();
    }

    validateLoginInputs() {
        let isValidEmail = this.emailInputEl && this.emailInputEl.validity;
        let isValidPassword = this.passwordInputEl && this.passwordInputEl.validity;
        //TODO: what is happening in this line exactly, we are also passing disabled at the level of the component
        if (this.loginBtnEl) {
            this.loginBtnEl.disabled = (!(isValidEmail && isValidPassword)); // this.hasVideoBackground() ? false :}
        }
    }

    onInputFocused(type: string) {
        this.error = '';
        type === 'password' ? (this.passwordFocused = true) : (this.emailFocused = true);
        if (isCordova() && (!isTablet() || this.hideTitleAndFooterForIpadMini)) {
            this.hideTitleAndFooter();
        }
        if (isIonic()) {
            this.inputFocused = true;
            if (this.focusAnimation) {
                this.focusAnimation.playFocus();
            }
        }
    }

    onInputBlurred(type: string) {
        this.validateLoginInputs();
        if (isIonic()) {
            type === 'password' ? (this.passwordFocused = false) : (this.emailFocused = false);
            setTimeout(() => {
                if (isCordova()) {
                    this.hideTitleAndFooter();
                }
            }, 100);
            this.inputFocused = false;
            if (this.focusAnimation) {
                this.focusAnimation.playBlur();
            }
        }
    }

    onPasswordIconClicked(ev: CustomEvent<string>) {
        if (ev.detail === 'clear') { this.validateLoginInputs(); }
    }

    hideTitleAndFooter() {
        if (this.emailFocused || this.passwordFocused) {
            if (this.loginContainerMobile) {
                let height: string = isIphone5() ? '75%' : '100%';
                this.loginContainerMobile.setAttribute('style', `height: ${height};`);
            }
            this.deviceInputFocused = true;
        } else {
            if (this.loginContainerMobile) {
                this.loginContainerMobile.setAttribute('style', `height: ${this.loginContainerMobileHeight}px;`);
            }
            this.deviceInputFocused = false;
        }
    }

    resizeLanguageSelectorWidth() {
        if (this.languageSelectorEl && this.languageSelectorEl.clientWidth) {
            this.spaceFillEl.setAttribute('style', `width: ${this.languageSelectorEl.clientWidth}px`);
        }
        this.language = this.currentLanguage;
    }

    resizePage() {
        if (isIonic()) {
            this.fullWindowHeight = window.innerHeight > this.fullWindowHeight ? window.innerHeight : this.fullWindowHeight;
        }
        this.showLeftPanel = window.innerWidth > MIN_SCREEN_SIZE_LEFT_PANEL;
        this.showHeaderFooterOnFocus = window.innerHeight > MINIMUM_SCREEN_SIZE_TO_SHOW_HEADER;
        this.hideTitleAndFooterForIpadMini = window.innerHeight < IPAD_MINI_SCREEN_HEIGHT && isIOS();
    }

    onLogin() {
        if (this.userEmail && this.userPassword && this.loginBtnEl.disabled === false) {
            let inputs: Array<HTMLElement> = querySelectorAllDeep(this.host, 'input');
            if (inputs && inputs.forEach) {
                inputs.forEach((el: HTMLInputElement) => el && el.blur && el.blur());
            }
            let loginDetails: ILoginDetails = { username: this.userEmail, password: this.userPassword };
            this.doLogin.emit(loginDetails);
            this.rememberMeSelected.emit(this.rememberMe);
        }
    }

    onForgotPassword() {
        isIonic() ? (
            this.presentActionSheet()
        ) :
            this.passwordResetModalRequested.emit(true);
    }

    presentActionSheet() {
        showActionSheet([
            { text: translate(this.resetPasswordButtonText), handler: () => this.passwordResetModalRequested.emit(true) },
            { text: translate(this.magicLinkButtonText), handler: () => this.magicLinkModalRequested.emit(true) }
        ]);
    }

    showLanguageModal() {
        const modalTopPadding = 5;
        let topPositionLanguageSelectorButton = Math.floor(this.languageSelectorButtonElement ? this.languageSelectorButtonElement.getBoundingClientRect().bottom : 0);
        let topPositionLanguageSelectorModal = Math.ceil(topPositionLanguageSelectorButton) + modalTopPadding;
        let languageSelectorEl = document.createElement('yoo-language-selector') as HTMLYooLanguageSelectorElement;
        languageSelectorEl.currentLanguage = this.currentLanguage;
        languageSelectorEl.languages = this.languages;
        languageSelectorEl.topPosition = topPositionLanguageSelectorModal;
        languageSelectorEl.rightPosition = isWeb() ? 1.875 : 1.75;
        showModal(languageSelectorEl, null, 'fullscreen', 'fadeEnterAnimation', 'fadeLeaveAnimation').then(ret => {
            if (ret && ret.data) {
                this.language = ret.data;
                this.languageSelectedParent.emit(ret.data);
            }
            languageSelectorEl = null;
        });
    }

    getVideoBackgroundClasses(): CssClassMap {
        if (this.hasVideoBackground() && !isWeb()) {
            return {
                'no-border': true,
                'translucent': true
            };
        }
    }

    renderLoginForm(): JSX.Element {
        return [
            <div ref={el => this.loginContainerMobile = el as HTMLElement} class={{
                'login-container-mobile': isIonic(),
                'login-container': !isIonic(),
                'iphone-se-focus': this.inputFocused && isIphoneSE()
            }}>
                {isIonic() ? null :
                    [<div class="login-title">
                        {translate(this.webLoginFormTitle)}
                    </div>,
                    <div class="login-subtitle">
                        {translate(this.webLoginFormSubtitle)}
                    </div>]}
                <yoo-form-input-container 
                    class={this.hasLoginScreenClass() ? 'login-screen' : ''} 
                    field={{ title: translate(this.emailLabel) }} 
                    required={true}>
                    <yoo-form-input
                        class={{
                            'login-web' : isWeb(),
                            ...this.getVideoBackgroundClasses()
                        }}
                        ref={el => this.emailInputEl = el as HTMLYooFormInputElement}
                        // id used by e2e selector
                        id="email-input"
                        type="email"
                        validators={[{ name: 'email' }, { name: 'required' }]} 
                        uiValidation={{ valid: false, invalid: true }}
                        onInputChanged={(event) => this.onInputChanged(event, 'email')}
                        onInputFocused={() => this.onInputFocused('email')}
                        onInputBlurred={() => this.onInputBlurred('email')}
                        onEnterPressed={() => this.onEnterPressed()}>
                    </yoo-form-input>
                </yoo-form-input-container>
                <div class="password-container">
                    <yoo-form-input-container class={this.hasLoginScreenClass() ? 'login-screen' : ''} field={{ title: translate(this.passwordLabel) }} required={true}>
                        <yoo-form-input
                            class={{
                                'login-web' : isWeb(),
                                ...this.getVideoBackgroundClasses()
                            }}
                            ref={el => this.passwordInputEl = el as HTMLYooFormInputElement}
                            id="password-input"
                            type="password"
                            showPasswordToggle={true}
                            validators={[{ name: 'required' }]} uiValidation={{ valid: false, invalid: true }}
                            onInputChanged={(event) => this.onInputChanged(event, 'password')}
                            onInputFocused={() => this.onInputFocused('password')}
                            onInputBlurred={() => this.onInputBlurred('password')}
                            onIconClicked={(ev) => this.onPasswordIconClicked(ev)}
                            onEnterPressed={() => this.onEnterPressed()}>
                        </yoo-form-input>
                    </yoo-form-input-container>
                </div>
                <div class={'inner-container' + (isIonic() ? ' mobile' : '')}>
                    <div class="radio">
                        {
                            this.showRememberMe &&
                            <yoo-form-radio 
                                text={translate(this.rememberMeText)} 
                                class={{'stable' : true,
                                       'success' : getAppContext()['operations'],
                                       'danger-light': getAppContext()['boost'] 
                                    }}
                                onRadioClicked={(event) => this.onRadioClicked(event)}>
                            </yoo-form-radio>
                        }
                    </div>
                    <yoo-button id="forgot-password"
                        text={translate(this.forgotPasswordText)}
                        onClick={() => this.onForgotPassword()}
                        class={{
                            'no-min-width medium': true,
                            'link-translucent' : this.hasVideoBackground() && !isWeb(),
                            'link-transparent-success' : isWeb() && getAppContext()['operations'],
                            'link-transparent-danger-light' : isWeb() && getAppContext()['boost'],
                            'login-screen': this.hasLoginScreenClass()
                        }}>
                    </yoo-button>
                </div>
                <div class={'login-button ' + (isCordova() ? 'device-padding' : '')}>
                    <yoo-button
                        ref={el => this.loginBtnEl = el as HTMLYooButtonElement}
                        id="login-btn"
                        disabled={!this.userEmail || !this.userPassword}
                        text={translate(this.loginButtonText)}
                        class={{
                            'full-width' : true,
                            'x-x-medium' : isWeb(),
                            'gradient-success' : getAppContext()['operations'],
                            'danger-light' : getAppContext()['boost'],
                            'large' : isIonic(),
                            'login-screen' : this.hasLoginScreenClass()
                        }}
                        onClick={() => this.onLogin()}></yoo-button>
                </div>
                {isIonic() && this.renderPoweredBy()}
            </div>
        ];
    }

    renderHeaderVideo(): JSX.Element {
        if (!this.hasVideoBackground() || isWeb() || ((isIphone5() || isIphoneSE()) && this.error) || (this.deviceInputFocused && isAndroid() && !this.showHeaderFooterOnFocus)) {
            return null;
        }
        if (getAppContext()['boost']) {
            this.videoHeaderIcon = './assets/logo/boost_portrait_light.svg';
        } else {
            this.videoHeaderIcon = './assets/logo/operations_portrait_light.svg';
        }
        return (<div
            ref={el => this.videoHeaderContainerEl = el as HTMLDivElement}
            class="video-header-container-mobile"
        >
            <img class="logo" src={this.videoHeaderIcon} height={'120'} alt="YOOBIC Logo" />
            <div class={{
                'text': true,
                'iphone-5': isIphone5() || isIphoneSE()
            }}>
                {translate('GLADTOSEEYOU')}
            </div>
        </div>);
    }

    renderLanguageSelector(): JSX.Element {
        return (
            <yoo-button id="language-selector"
                ref={el => this.languageSelectorButtonElement = el as HTMLYooButtonElement}
                class={{
                    'clear': true,
                    'squared': true,
                    'small': true,
                    'no-shadow': true,
                    'login-screen': this.hasLoginScreenClass(),
                    'translucent': this.hasVideoBackground() && !isWeb()
                }}
                onClick={() => this.showLanguageModal()}
                text={this.currentLanguage}
                icon="yo-down"
                translateText={false}>
            </yoo-button>
        );
    }

    renderPoweredBy(): JSX.Element {
        if (!((this.error || this.inputFocused) && isCordova() && isAndroid())) {
            return [
                <div class="powered-by">
                    {translate(this.leftPanelFooterText)}
                    <div class="powered-img">
                        <img src={isIonic() || !this.showLeftPanel ? './assets/logo/yoobic_simple_grey.svg' : './assets/logo/yoobic_simple_white.svg'} height="12.8" />
                    </div>
                    <div class="yoobic-text">
                        YOOBIC
                </div>
                </div>,
                <div class="powered-by version">
                    v{this.version}
                </div>

            ];
        }

    }

    renderFooter(): JSX.Element {
        return (
            isIonic() ? <yoo-button 
                            text={translate('ADVANCEDLOGIN')} 
                            onClick={() => this.onAdvancedLogin()} 
                            class={{
                                'block' : true,
                                'login-screen' : this.hasLoginScreenClass(),
                                'transparent' : (this.hasVideoBackground() && !isWeb()),
                                'stable' : (!this.hasVideoBackground() && isWeb()),
                                'medium' : isWeb()
                            }}>
                            </yoo-button>
                : this.renderPoweredBy()
        );
    }

    renderVideo(): JSX.Element {
        return <video
            ref={el => this.loginVideoEl = el as HTMLVideoElement}
            class={{ 'android': isAndroid() }}
            src={this.videoBackgroundUrl}
            muted
            autoplay
            loop
            playsinline
            webkit-playsinline
        />;
    }

    renderHeader(): JSX.Element {
        return <div class="header">
            {isIonic() && <div class="space-fill" ref={el => this.spaceFillEl = el as HTMLDivElement} ></div>}
            <div class="logo">
                <img src={this.leftPanelWebHeaderIcon} height="40" alt="YOOBIC Logo" />
            </div>
        </div>;
    }

    renderPanelBody(type?: string): JSX.Element {
        if (type === 'leftPanel') {
            return <div class="left-body">
                {this.webSubtitleText.map((text) =>
                    <div class="subtitle-container">
                        {text}
                    </div>
                )}
            </div>;
        }
        return '';
    }

    renderLeftPanel(): JSX.Element {
        let backStyle;
        if (!this.hasVideoBackground() && !isWeb()) {
            backStyle = { backgroundImage: `url(${this.backgroundSrc})` };
        }
        return (
            <div class="left-panel">
                {this.backgroundSrc && backStyle ?
                    <div class="background" style={backStyle}></div> : (this.hasVideoBackground() ? this.renderVideo() : null)
                }
                <div class={'background-overlay ' + 'bg-' + (this.backgroundColor || 'dark')}></div>
                <div class="content-container">
                    {this.renderHeader()}
                    {this.renderPanelBody('leftPanel')}
                    <div class={{
                        'footer': true,
                        'mobile': !isWeb(),
                        'web': isWeb()}}>
                        {this.renderFooter()}
                    </div>
                </div>
            </div>
        );
    }

    renderErrorBanner(): JSX.Element {
        return <yoo-banner id="error-alert" animationName="sticky_up" class="danger embedded centered header"
            text={this.error}
            closeable={!isIonic()}
            link={!isIonic() ? `Problems? We're here to help` : ''}
            onAlertActionSelected={() => this.onAlertActionSelected()}
            onAlertClosed={() => this.onAlertClosed()}>
        </yoo-banner>;
    }

    renderRightPanel(): JSX.Element {
        return (
            <div class={{
                'right-panel': true,
                'mobile': isIonic(),
                'ios': isCordova() && isIOS(),
                'video-background': this.hasVideoBackground() && !isWeb()
            }} justify-content="flex-start">
                {this.hasVideoBackground() && !isWeb() && this.renderVideo()}
                {this.error && this.renderErrorBanner()}
                <div class="right-panel-content" justify-content="space-between">
                    <div id="header" class={{
                        'header': true,
                        'mobile': isIonic() || !this.showLeftPanel,
                        'web' : isWeb(),
                        'ios': isCordova() && isIOS(),
                        'iphone-x': isIphoneX(),
                        'no-padding': + this.error && isIonic()
                    }}>
                        {(isIonic() || !this.showLeftPanel && [
                            <div class="space-fill"></div>,
                            <div class="logo">
                                {this.hasVideoBackground() && !isWeb() ? null : <img src={this.leftPanelMobileHeaderIcon} height={'25'} alt="YOOBIC Logo" />}
                            </div>
                        ])}
                        <div class="language-container">
                            {this.renderLanguageSelector()}
                        </div>
                    </div>
                    <div class={{ 'content': true, 'mobile': isIonic(), 'small-android': isAndroid() && !this.showHeaderFooterOnFocus }} justify-content="center">
                        {this.renderHeaderVideo()}
                        {this.renderLoginForm()}
                    </div>
                    {<div class={{
                        'footer': true,
                        'web': isWeb(),
                        'iphone-x': isIphoneX()
                    }}>
                        {isIonic() || !this.showLeftPanel ? this.renderFooter() :
                            <yoo-button 
                                text={translate('ADVANCEDLOGIN')} 
                                onClick={() => this.onAdvancedLogin()}
                                class={{
                                    'login-screen' : this.hasLoginScreenClass(),
                                    'medium' : isWeb(),
                                    'link-transparent-success' : getAppContext()['operations'],
                                    'link-transparent-danger-light' : getAppContext()['boost'],
                                    'iphone-x-padding' : isIphoneX()
                                }}>
                            </yoo-button>}
                    </div>}
                </div>
            </div>
        );
    }

    renderLoading(): JSX.Element {
        return <yoo-loader class="absolute large backdrop" ></yoo-loader>;
    }

    render(): JSX.Element {
        return (
            <div ref={el => this.outerContainerElement = el as HTMLDivElement} class="outer-container" >
                {this.loading && this.renderLoading()}
                {isWeb() && this.showLeftPanel && this.renderLeftPanel()}
                {this.renderRightPanel()}
            </div>
        );
    }
}
