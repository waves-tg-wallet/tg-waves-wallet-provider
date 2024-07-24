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

export class TelegramProvider implements Provider {
	public user: UserData | null = null;

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

	connect(_options: ConnectOptions): Promise<void> {
		return Promise.resolve();
	}

	login(): Promise<UserData> {
		return new Promise((resolve, reject) => {
			loadConnection().then((connection) => {
				if (connection.status === 'new') {
					Cookies.set('token', connection.token)
				} else if (connection.status === 'approved' && connection.publicKey !== undefined) {
					resolve({
						address: connection.address!,
						publicKey: connection.publicKey
					});
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
							id: connection._id
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
				const tx = list[0];
				const requested = await post<{ id: string, status: 'new' | 'approved' | 'rejected' }>('/transaction/request_sign', tx);
				const { id, status } = requested;
				if (status && status === 'new') {
					let tries = 0;
					let badTries = 0;
					const intervalId = setInterval(async () => {
						if (tries === 30 || badTries === 3) {
							clearInterval(intervalId);
							return Promise.reject('timeout');
						}
						try {
							const signStatus = await get<{ id: string, status: 'new' | 'approved' | 'rejected' }>(`/status/${id}`)
							if (signStatus.status === 'rejected') {
								clearInterval(intervalId);
								return Promise.reject('rejected');
							} else if (signStatus.status === 'approved') {
								clearInterval(intervalId);
								return Promise.resolve();
							}
							tries += 1;
						} catch {
							badTries += 1;
						}
					}, 1000);
				}
			} catch (ex) {
				console.log(ex)
				return Promise.reject();
			}
		}
	}
}
