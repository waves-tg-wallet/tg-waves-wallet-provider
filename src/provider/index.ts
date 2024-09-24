import {
    AuthEvents,
    ConnectOptions,
    Handler,
    Provider,
    SignedTx,
    SignerTx,
    TypedData,
    UserData,
} from "@waves/signer";

import { WebAppProviderTelegram } from "./webapp";
import { SiteProviderTelegram } from "./site";
import { get } from "../utils/http";
import Cookies from 'js-cookie'
import { IStyle, TProviderTelegramType } from "../types";
// import { sleep } from './utils';



export class ProviderTelegram implements Provider {
    public user: UserData | null = null;

    private options: ConnectOptions = {
        NETWORK_BYTE: "W".charCodeAt(0),
        NODE_URL: "https://nodes.wavesplatform.com",
    };

    private selectedProvider: TProviderTelegramType = 'site';
	private styleParams: IStyle;

    constructor(styleParams: IStyle = {}) {
		this.styleParams = styleParams;
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://telegram.org/js/telegram-web-app.js";
        script.onload = () => {
            console.log("telegram loaded successfuly");
            if (
                window.Telegram &&
                window.Telegram.WebApp &&
                window.Telegram.WebApp.initData.length > 0
            ) {
                console.log("WebAppProviderTelegram");
                this.selectedProvider = 'webapp'
            } else {
                console.log("SiteProviderTelegram");
                this.selectedProvider = 'site'
            }
        };
        script.onerror = () => {
            console.log("Error occurred while loading telegram");
            this.selectedProvider = 'webapp'
        };
        document.body.appendChild(script);
    }

    isSignAndBroadcastByProvider?: false;
    //@ts-ignore
    on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider {
        throw new Error("Method not implemented.");
    }
    //@ts-ignore
    once<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider {
        throw new Error("Method not implemented.");
    }
    //@ts-ignore
    off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider {
        throw new Error("Method not implemented.");
    }

    connect(options: ConnectOptions): Promise<void> {
        this.options = options;
		console.log(`ProviderType: ${this.selectedProvider}; NODE_URL: ${this.options.NODE_URL}`);
		return Promise.resolve();
    }

    login(): Promise<UserData> {
        if (this.selectedProvider === 'webapp') {
			return new WebAppProviderTelegram(this.options).login();
		} else {
			return new SiteProviderTelegram(this.options, this.styleParams).login();
		}
    }

    async logout(): Promise<void> {
        try {
			const token = Cookies.get('token');
			await get('/connection/delete', token);
		} catch { }
		Cookies.remove('token')
		return Promise.resolve();
    }
    //@ts-ignore
    signMessage(data: string | number): Promise<string> {
        throw new Error("Method not implemented.");
    }
    //@ts-ignore
    signTypedData(data: Array<TypedData>): Promise<string> {
        throw new Error("Method not implemented.");
    }
    sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
    sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;

    public async sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>> {
        //@ts-ignore
        if (this.selectedProvider === 'webapp') {
			return new WebAppProviderTelegram(this.options).sign(toSign);
		} else {
			return new SiteProviderTelegram(this.options).sign(toSign);
		}
    }
}
