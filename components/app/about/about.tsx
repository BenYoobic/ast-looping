import { Component, Element, Prop, ComponentInterface } from '@stencil/core';
import { getGrade, translate, getDeviceType, getOS } from '../../../index'; //'../../../../stencil';

@Component({
    tag: 'yoo-about',
    styleUrl: 'about.scss',
    shadow: true
})
export class YooAboutComponent implements ComponentInterface {
    @Prop() logo: string;
    @Prop() app: string;
    @Prop() version: string;
    @Prop() twitter: string;
    @Prop() linkedin: string;

    @Element() host: HTMLStencilElement;

    render(): JSX.Element {
        return (
            <div class="outer-container">
                <div class="content">
                    <img src={this.logo} height="51.8" alt="YOOBIC Logo" />
                    <div class="informations">
                        <div class="information">
                            {this.app} {this.version}
                        </div>
                        <div class="information">
                            © 2014 - {new Date().getFullYear()} Yoobic Ltd.
                        </div>
                        <div class="information">
                            {translate('DEVICE') + ': '} {translate('GRADE') + ' ' + getGrade() + ' - '} {getDeviceType() + ' - '} {getOS()}
                        </div>
                    </div>
                    <div class="links-container">
                        {this.twitter ? <a href={this.twitter} target="_blank"><yoo-icon class="yo-twitter"></yoo-icon></a> : null}
                        {this.linkedin ? <a href={this.linkedin} target="_blank"><yoo-icon class="yo-linkedin"></yoo-icon></a> : null}
                    </div>
                </div>
                <div class="footer">
                    <div class="powered-by">
                        {translate('POWEREDBY')}
                        <div class="powered-img">
                            <img src="./assets/logo/yoobic_simple.svg" height="12.8" />
                        </div>
                        <div class="yoobic-text">
                            YOOBIC
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}
