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


import Cookies from 'js-cookie'
import { loadConnection } from "../utils/connection";
import { get, post } from "../utils/http";
import { IProviderTelegram } from ".";
import { IProviderTelegramConfig, TProviderTelegramType } from "..";

export class WebAppProviderTelegram implements IProviderTelegram {
	type: TProviderTelegramType = 'webapp';
	options: ConnectOptions;
	providerConfig: IProviderTelegramConfig;

	constructor(options: ConnectOptions, config: IProviderTelegramConfig) {
		this.options = options;
		this.providerConfig = config;
	}

	login(): Promise<UserData> {
		let token = Cookies.get('token');
		const config = this.providerConfig;
		const hostname = document.location.hostname;
        return new Promise(async (resolve, reject) => {
			loadConnection({ providerType: 'webapp', url: hostname }, token).then((connection) => {
				if (connection.status === 'new') {
					token = connection.token;
				} else if (connection.status === 'approved' && connection.publicKey !== undefined) {
					resolve({
						address: connection.address!,
						publicKey: connection.publicKey
					});
					return;
				}
				const title = document.title;
				const queryString = window.btoa(JSON.stringify({
					method: 'connect_rpc',
					id: connection._id,
					appName: title.substring(0, 16),
					appUrl: hostname,
					networkByte: this.options.NETWORK_BYTE
				}));
				const pathname = `?startapp=${queryString}`;
				const url = `https://t.me/${config.botName}${pathname}`;
				const wsUrl = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${connection._id}`;
				const webSocket = new WebSocket(wsUrl);

				webSocket.onmessage = function (event) {
					try {
						const data = JSON.parse(event.data) as UserData & ({status: 'approved' | 'rejected'});
						if (webSocket.OPEN) {
							webSocket.close();
						}
						if (data.status === 'approved') {
							Cookies.set('token', token!, { expires: 30 });
							resolve({
								publicKey: data.publicKey,
								address: data.address
							});
						} else {
							reject(new Error(data.status));
						}
					} catch {
						reject(new Error('something went wrong'));
					}
				};
	
				webSocket.onclose = function (_event) {
					reject(new Error('timeout'));
				};
	
				webSocket.onerror = function (error) {
					console.log(error);
					reject(new Error('something went wrong'));
				};
	
				window.Telegram.WebApp.openTelegramLink(url);
			}).catch((ex) => {
				reject(new Error(ex.message));
			})
        })
	}

	public async sign(toSign: Array<SignerTx>): Promise<Array<SignedTx<SignerTx>>> {
		return new Promise(async (resolve, reject) => {
			if (toSign.length > 1) {
				reject("Only one transaction allowed");
			} else {
				try {
					const config = this.providerConfig;
					const token = Cookies.get('token');
					if (token === undefined) {
						reject("Please, login first")
					}
					
					const tx = toSign[0];
					const requested = await post<{ id: string, status: 'success' | 'failed' }>('/transaction/webapp_request_sign', {
						tx: {
							...tx
						},
						networkByte: this.options.NETWORK_BYTE
					}, token);
					const { id, status } = requested;
					if (status === 'success') {
						const queryString = window.btoa(JSON.stringify({
							method: 'sign_tx_rpc',
							id,
							networkByte: this.options.NETWORK_BYTE
						}));
						const pathname = `?startapp=${queryString}`;
						const url = `https://t.me/${config.botName}${pathname}`;
						const wsUrl = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${id}`;
						const webSocket = new WebSocket(wsUrl);
						webSocket.onmessage = function (event) {
							try {
								const data = JSON.parse(event.data) as { tx: SignedTx<SignerTx>, status: 'signed' | 'rejected'};
								if (webSocket.OPEN) {
									webSocket.close();
								}
								if (data.status === 'signed') {
									resolve([data.tx])
								} else {
									reject(status)
								}
							} catch {
								reject('something went wrong');
							}
						};
					
						webSocket.onclose = function (_event) {
							reject('timeout');
						};
					
						webSocket.onerror = function (error) {
							console.log(error);
							reject('something went wrong');
						};
	
						window.Telegram.WebApp.openTelegramLink(url);
					} else {
						reject('unable to send request')
					}
				} catch (ex) {
					console.log(ex)
					return reject();
				}
			}
		})
	}
}

/*


public user: UserData | null = null;
    //@ts-ignore
	private options: ConnectOptions = {
        NETWORK_BYTE: 'W'.charCodeAt(0),
        NODE_URL: 'https://nodes.wavesplatform.com',
    };

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
		console.log(`WebAppProviderTelegram: ${this.options.NODE_URL}`);
		return Promise.resolve();
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
	//@ts-ignore
	
*/