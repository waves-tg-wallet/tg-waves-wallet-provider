import { AuthEvents, ConnectOptions, Handler, Provider, SignedTx, SignerTx, TypedData, UserData } from "@waves/signer";

import { WebAppProviderTelegram } from "./webapp";
import { SiteProviderTelegram } from "./site";
import { get } from "../utils/http";
import Cookies from "js-cookie";
import { IProviderTelegramConfig, TProviderTelegramType } from "../";
import { loadConnection } from "../utils/connection";

export interface IProviderTelegram {
    type: TProviderTelegramType;
    options: ConnectOptions;
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
    signMessage(data: string | number): Promise<string>;
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
        bgColor: "#ffffff",
        textColor: "#000000",
        buttonColor: "#177DFF",
        buttonTextColor: "#fffffff",
        darkBgColor: "#202428",
        darkTextColor: "#ffffff",
        darkButtonColor: "#177DFF",
        darkButtonTextColor: "#fffffff",
        botName: "aurawallet_bot/wallet",
        linkDeliveryMethod: "message",
        lightDark: true,
    };

    constructor(config: Partial<IProviderTelegramConfig> = {}) {
        super();
        this.providerConfig = { ...this.providerConfig, ...config };
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://telegram.org/js/telegram-web-app.js";
        script.onload = () => {
            if (window.Telegram && window.Telegram.WebApp.initData.length > 0) {
                this.selectedProvider = new WebAppProviderTelegram(this.options, this.providerConfig); //'webapp';
                this.eventTarget.dispatchEvent(new CustomEvent("injected", { detail: "webapp" }));
            } else {
                this.selectedProvider = new SiteProviderTelegram(this.options, this.providerConfig); //'site';
                this.eventTarget.dispatchEvent(new CustomEvent("injected", { detail: "site" }));
            }
            console.log(`ProviderType: ${this.selectedProvider!.type}; NODE_URL: ${this.options.NODE_URL}`);
        };
        script.onerror = () => {
            console.log(`Error occurred while loading telegram; ProviderType: ${this.selectedProvider!.type}; NODE_URL: ${this.options.NODE_URL}`);
            this.selectedProvider = new SiteProviderTelegram(this.options, this.providerConfig); //'site';
            this.eventTarget.dispatchEvent(new CustomEvent("injected", { detail: "site" }));
        };
        document.body.appendChild(script);
    }

    isSignAndBroadcastByProvider?: false;

    onLoad(event: "injected", handler: (type: TProviderTelegramType) => void) {
        const wrappedHandler: EventListener = (e: Event) => {
            const customEvent = e as CustomEvent; // Приведение типа события к CustomEvent
            handler(customEvent.detail); // Вызов оригинального обработчика с переданным параметром
            this.eventTarget.removeEventListener(event, wrappedHandler); // Удаление обработчика после первого вызова
        };
        this.eventTarget.addEventListener(event, wrappedHandler);
    }

    once<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): this {
        throw new Error("Method not implemented.");
    }

    //@ts-ignore
    on<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider {
        throw new Error("Method not implemented.");
    }

    off<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider {
        throw new Error("Method not implemented.");
    }

    private waitForLogin(timeout: number): Promise<UserData> {
        return new Promise((resolve, reject) => {
            const interval = 100; // Интервал проверки в миллисекундах
            let elapsed = 0;

            const checkProvider = () => {
                elapsed += interval;
    
                if (this.selectedProvider) {
                    clearInterval(timer);
                    resolve(this.selectedProvider!.login());
                } else if (elapsed >= timeout) {
                    clearInterval(timer);
                    reject(new Error('timeout')); // Таймаут, вернуть undefined
                }
            };
            const timer = setInterval(checkProvider, interval);
        })
    }

    connect(options: ConnectOptions): Promise<void> {
        this.options = options;
        return Promise.resolve();
    }

    login(): Promise<UserData> {
        return this.waitForLogin(5000);
    }

    async logout(): Promise<void> {
        try {
            const token = Cookies.get("token");
            Cookies.remove("token");
            await get("/connection/delete", token);
        } catch {}
        return Promise.resolve();
    }
    //@ts-ignore 
    signMessage(data: string | number): Promise<string> {
        return this.selectedProvider!.signMessage(data);
    }
    //@ts-ignore
    signTypedData(data: Array<TypedData>): Promise<string> {
        throw new Error("signTypedData not implemented.");
    }
    sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
    sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;

    public async sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>> {
        //@ts-ignore
        return this.selectedProvider.sign(toSign);
    }

    public isAlive(): Promise<UserData> {
        const provider = this.selectedProvider;
        return new Promise(async (resolve) => {
            try {
                const token = Cookies.get("token");
                if (token) {
                    const body: { providerType: TProviderTelegramType; url: string } = {
                        providerType: provider!.type,
                        url: document.location.hostname,
                    };
                    const resp = await loadConnection(body, token);
                    if (resp.status === "approved" && resp.publicKey !== undefined) {
                        resolve({
                            address: resp.address!,
                            publicKey: resp.publicKey,
                        });
                    }
                }
            } catch (ex) {
                console.log(ex);
            }
        });
    }
}
