import {
	ConnectOptions,
	SignedTx,
	SignerTx,
	UserData,
} from "@waves/signer";

import Cookies from 'js-cookie'
import ConnectionView from '../views/ConnectionView.vue'
import { createApp, h } from "vue";
import { loadConnection } from "../utils/connection";
import { post } from '../utils/http';
import { IProviderTelegram, IStyle } from "../types";

export class SiteProviderTelegram implements IProviderTelegram {
	options: ConnectOptions;
	styleParams: IStyle = {
		maxWidth: '300px',
		height: '400px',
		lightBgColor: '#ffffff',
		darkBgColor: '#13171f',
		lightTextColor: '#000000',
		darkTextColor: '#ffffff',
		lightButtonColor: '#1095c1',
		darkButtonColor: '#1095c1',
		lightButtonTextColor: '#fffffff',
		darkButtonTextColor: '#fffffff'
	};

	constructor(options: ConnectOptions, style?: IStyle) {
		this.options = options;
		if (style) {
			this.styleParams = {
				...this.styleParams,
				...style
			};
		}
		console.log(this.styleParams)
	}

	login(): Promise<UserData> {
		let token = Cookies.get('token');
		return new Promise((resolve, reject) => {
			const options = this.options;
			const styleParams = this.styleParams;
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
							networkByte: options.NETWORK_BYTE,
							style: styleParams
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
