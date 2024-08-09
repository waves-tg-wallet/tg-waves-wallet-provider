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

import { v4 as uuidv4} from 'uuid';
import Cookies from 'js-cookie'
import { loadConnection } from "../utils/connection";
import { get, post } from "../utils/http";

export class WebAppTelegramProvider implements Provider {
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
		return Promise.resolve();
	}
	

	login(): Promise<UserData> {
		let token = Cookies.get('token');
        return new Promise(async (resolve, reject) => {
			loadConnection(token).then((connection) => {
				if (connection.status === 'new') {
					token = connection.token;
				} else if (connection.status === 'approved' && connection.publicKey !== undefined) {
					resolve({
						address: connection.address!,
						publicKey: connection.publicKey
					});
					return;
				}

				const queryString = window.btoa(JSON.stringify({
					method: 'connect_rpc',
					id: connection._id,
					networkByte: this.options.NETWORK_BYTE
				}));
				const pathname = `?startapp=${queryString}`;
				const url = `${import.meta.env.VITE_WEB_APP_URL}${pathname}`;
				const wsUrl = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${connection._id}`;
				const webSocket = new WebSocket(wsUrl);

				webSocket.onmessage = function (event) {
					try {
						const data = JSON.parse(event.data) as UserData;
						if (webSocket.OPEN) {
							webSocket.close();
						}
						Cookies.set('token', token);
						resolve({
							publicKey: data.publicKey,
							address: data.address
						});
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
			}).catch((ex) => {
				reject(new Error(ex.message));
			})
        })
	}

	async logout(): Promise<void> {
		try {
			await get('/delete');
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
	public async sign(toSign: Array<SignerTx>): Promise<Array<SignedTx<SignerTx>>> {
		return new Promise(async (resolve, reject) => {
			if (toSign.length > 1) {
				reject("Only one transaction allowed");
			} else {
				try {
					const token = Cookies.get('token');
					if (token === undefined) {
						reject("Please, login first")
					}
					
					const tx = toSign[0];
					const requested = await post<{ id: string, status: 'success' | 'failed' }>('/transaction/request_sign', {
						tx: {
							...tx
						},
						networkByte: this.options.NETWORK_BYTE
					}, token);
					const { id, status } = requested;
					if (status === 'success') {
						const queryString = window.btoa(JSON.stringify({
							method: 'sign_tx_rpc',
							token,
							networkByte: this.options.NETWORK_BYTE
						}));
						const pathname = `?startapp=${queryString}`;
						const url = `${import.meta.env.VITE_WEB_APP_URL}${pathname}`;
						const wsUrl = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${token}`;
						const webSocket = new WebSocket(wsUrl);
						webSocket.onmessage = function (event) {
							try {
								const data = JSON.parse(event.data) as SignedTx<SignerTx>;
								if (webSocket.OPEN) {
									webSocket.close();
								}
								resolve([data])
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
