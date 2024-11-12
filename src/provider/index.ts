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
import { FrameProviderTelegram } from "./iframe";
import { get } from "../utils/http";
import Cookies from 'js-cookie'
import { IProviderTelegramConfig, TProviderTelegramType } from "../";
import { loadConnection } from "../utils/connection";




export interface IProviderTelegram {
    type: TProviderTelegramType;
    options: ConnectOptions;
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
}

export class ProviderTelegram extends EventTarget implements Provider {
    public user: UserData | null = null;
    private eventTarget = new EventTarget();

    private options: ConnectOptions = {
        NETWORK_BYTE: "W".charCodeAt(0),
        NODE_URL: "https://nodes.wavesplatform.com",
    };

    private selectedProvider?: IProviderTelegram;
	private providerConfig: IProviderTelegramConfig = {
		bgColor: '#ffffff',
		textColor: '#000000',
		buttonColor: '#177DFF',
		buttonTextColor: '#fffffff',
		darkBgColor: '#202428',
		darkTextColor: '#ffffff',
		darkButtonColor: '#177DFF',
		darkButtonTextColor: '#fffffff',
		botName: 'aurawallet_bot/wallet',
		linkDeliveryMethod: 'message',
		lightDark: true
	};

    constructor(config: Partial<IProviderTelegramConfig> = {}) {
        super();
		this.providerConfig = {...this.providerConfig, ...config};
        const searchParams = new URL(document.location.href).searchParams
        const source = searchParams.get('utm_source');
        const address = searchParams.get('address');
        const publicKey = searchParams.get('public_key');
        if (source === 'aura' && address && publicKey) {
            this.selectedProvider = new FrameProviderTelegram({address, publicKey}, this.options, this.providerConfig);
            this.eventTarget.dispatchEvent(new CustomEvent('injected', { detail: 'iframe' }));
        } else {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://telegram.org/js/telegram-web-app.js";
            script.onload = () => {
                console.log('check webapp', window.Telegram.WebApp.initData)
                if ((window.Telegram && window.Telegram.WebApp.initData.length > 0)) {
                    console.log("WebAppProviderTelegram");
                    this.selectedProvider = new WebAppProviderTelegram(this.options, this.providerConfig);//'webapp';
                    this.eventTarget.dispatchEvent(new CustomEvent('injected', { detail: 'webapp' }));
                } else {
                    console.log("SiteProviderTelegram");
                    this.selectedProvider = new SiteProviderTelegram(this.options, this.providerConfig);//'site';
                    this.eventTarget.dispatchEvent(new CustomEvent('injected', { detail: 'site' }));
                }
            }
            script.onerror = () => {
                console.log("Error occurred while loading telegram");
                this.selectedProvider = new SiteProviderTelegram(this.options, this.providerConfig);//'site';
                this.eventTarget.dispatchEvent(new CustomEvent('injected', { detail: 'site' }));
            };
            document.body.appendChild(script);
        }
    }; 

    isSignAndBroadcastByProvider?: false;


    onLoad(event: 'injected', handler: (type: TProviderTelegramType) => void) {
        const wrappedHandler: EventListener = (e: Event) => {
            const customEvent = e as CustomEvent; // Приведение типа события к CustomEvent
            handler(customEvent.detail); // Вызов оригинального обработчика с переданным параметром
            this.eventTarget.removeEventListener(event, wrappedHandler); // Удаление обработчика после первого вызова
        };
        this.eventTarget.addEventListener(event, wrappedHandler);
    }

    once<EVENT extends keyof AuthEvents> (
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): this {
        throw new Error("Method not implemented.");
    }

    //@ts-ignore
    on<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider {
        throw new Error("Method not implemented.");
    }
    
    off<EVENT extends keyof AuthEvents>(
        event: EVENT,
        handler: Handler<AuthEvents[EVENT]>
    ): Provider {
        throw new Error("Method not implemented.");
    }

    connect(options: ConnectOptions): Promise<void> {
        this.options = options;
		console.log(`ProviderType: ${this.selectedProvider!.type}; NODE_URL: ${this.options.NODE_URL}`);
		return Promise.resolve();
    }

    login(): Promise<UserData> {
        return this.selectedProvider!.login();
    }

    async logout(): Promise<void> {
        try {
			const token = Cookies.get('token');
            Cookies.remove('token')
			await get('/connection/delete', token);
		} catch { }
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
        return this.selectedProvider.sign(toSign);
    }

    public isAlive(): Promise<UserData> {
        return new Promise(async (resolve) => {
            if (this.selectedProvider!.type === 'iframe') {
                resolve((this.selectedProvider as FrameProviderTelegram).user);
            } else {
                try {
                    const token = Cookies.get('token');
                    if (token) {
                        const body: {providerType: TProviderTelegramType, url: string } = {
                            providerType: this.selectedProvider!.type,
                            url: document.location.hostname
                        }
                        const resp = await loadConnection(body, token);
                        if (resp.status === 'approved' && resp.publicKey !== undefined) {
                            resolve({
                                address: resp.address!,
                                publicKey: resp.publicKey
                            });
                        }
                    }
                } catch (ex) {
                    console.log(ex)
                }
            }
        });
    }
}
