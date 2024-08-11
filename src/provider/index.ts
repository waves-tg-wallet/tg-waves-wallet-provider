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


import { WebAppProviderTelegram } from './webapp';
import { SiteProviderTelegram } from './site';
// import { sleep } from './utils';

export class ProviderTelegram implements Provider {
	public user: UserData | null = null;
	//@ts-ignore
	private options: ConnectOptions = {
        NETWORK_BYTE: 'W'.charCodeAt(0),
        NODE_URL: 'https://nodes.wavesplatform.com',
    };

	private selectedProvider: Provider;


	constructor()
	{
		console.log(window.Telegram)
		if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData.length > 0) {
			console.log('WebAppProviderTelegram')
			this.selectedProvider = new WebAppProviderTelegram();
		} else {
			console.log('SiteProviderTelegram')
			this.selectedProvider = new SiteProviderTelegram();
		}
	}

	isSignAndBroadcastByProvider?: false;
	//@ts-ignore
	on<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider {
		throw new Error("Method not implemented.");
	}
	//@ts-ignore
	once<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider {
		throw new Error("Method not implemented.");
	}
	//@ts-ignore
	off<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider {
		throw new Error("Method not implemented.");
	}

	connect(options: ConnectOptions): Promise<void> {
		this.options = options;
		return this.selectedProvider.connect(options);
	}
	

	login(): Promise<UserData> {
		return this.selectedProvider.login();
	}

	async logout(): Promise<void> {
		return this.selectedProvider.logout();
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
		return this.selectedProvider.sign(toSign)
	}
}
