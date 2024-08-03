import './global.css'
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
import ConnectionView from './views/ConnectionView.vue'
import { createApp, h } from "vue";
import { loadConnection } from "./utils/connection";
import { get, post } from './utils/http';
import { sleep } from './utils';

export class TelegramProvider implements Provider {
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
	public async sign(list: Array<SignerTx>): Promise<Array<SignedTx<SignerTx>>> {
		if (list.length > 1) {
			throw new Error("Only one transaction allowed");
		} else {
			try {
				const token = Cookies.get('token');
				const tx = list[0];
				const requested = await post<{ id: string, status: 'new' | 'approved' | 'rejected' }>('/transaction/request_sign', tx, token);
				const { id, status } = requested;
				if (status && status === 'new') {
					let badTries = 0;
					for (let t = 1; t <= 30; t++) {
						try {
							const signStatus = await get<{ id: string, status: 'new' | 'approved' | 'rejected' }>(`/transaction/status/${id}`, token);
							if (signStatus.status === 'rejected') {
								return Promise.reject('rejected');
							} else if (signStatus.status === 'approved') {
								//@ts-ignore
								return Promise.resolve();
							}
						} catch {
							badTries += 1;
						}
						if (badTries === 3) {
							return Promise.reject(new Error('timeout'));
						}
						await sleep(1000);
					}
					return Promise.reject(new Error('timeout'));
				}
			} catch (ex) {
				console.log(ex)
				return Promise.reject();
			}
		}
	}
}
