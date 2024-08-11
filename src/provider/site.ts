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
import ConnectionView from '../views/ConnectionView.vue'
import { createApp, h } from "vue";
import { loadConnection } from "../utils/connection";
import { get, post } from '../utils/http';
// import { sleep } from './utils';

export class SiteProviderTelegram implements Provider {
	public user: UserData | null = null;
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
		return new Promise((resolve, reject) => {
			const options = this.options;
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
				const container = document.createElement('div');
				document.body.appendChild(container);
				const app = createApp({
					setup() {
						const handleConnected = (value: UserData) => {
							resolve({
								address: value.address,
								publicKey: value.publicKey
							});
							app.unmount();
							document.body.removeChild(container);
						}

						const handleRejected = (value: string) => {
							reject(new Error(value))
							app.unmount();
							document.body.removeChild(container);
						}

						const props = {
							id: connection._id,
							token: token!,
							networkByte: options.NETWORK_BYTE
						}

						return () => h(ConnectionView, {
							...props,
							onConnected: handleConnected,
							onRejected: handleRejected
						});
					}
				});
				app.mount(container);
			}).catch((ex) => {
				reject(new Error(ex.message));
			})

		});
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

	//sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
	//sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;
    
	public async sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>> {
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
					if (status && status === 'success') {
						const url = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${id}`;
						const webSocket = new WebSocket(url);
						webSocket.onmessage = function (event) {
							try {
								const data = JSON.parse(event.data) as { tx: SignedTx<SignerTx>, status: 'signed' | 'rejected'};
								console.log('incoming data:', data)
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
					}
				} catch (ex) {
					console.log(ex)
					return reject();
				}
			}
		})
	}
}
