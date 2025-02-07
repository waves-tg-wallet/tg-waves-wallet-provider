import {
	ConnectOptions,
	SignedTx,
	SignerTx,
	UserData,
} from "@waves/signer";

import Cookies from 'js-cookie'
import Signer from '../components/Signer.vue'
import { createApp, h } from "vue";
import { loadConnection } from "../utils/connection";
import { post } from '../utils/http';
import { IProviderTelegram } from ".";
import { IProviderTelegramConfig, TProviderTelegramType } from "../";

export class SiteProviderTelegram implements IProviderTelegram {
	type: TProviderTelegramType = 'site';
	options: ConnectOptions;
	providerConfig: IProviderTelegramConfig;

	constructor(options: ConnectOptions, config: IProviderTelegramConfig) {
		this.options = options;
		this.providerConfig = config;
	}

	login(): Promise<UserData> {
		let token = Cookies.get('token');
		return new Promise((resolve, reject) => {
			const options = this.options;
			const config = this.providerConfig;
			loadConnection({ providerType: 'site', url: document.location.hostname }, token).then((connection) => {
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
						const handleConnected = (value: UserData & { status: string }) => {
							if (value.status === 'approved' && value.publicKey) {
								Cookies.set('token', token!, { expires: 30 });
								resolve({
									address: value.address,
									publicKey: value.publicKey
								});
							} else {
								reject(new Error('user rejected'))
							}
							app.unmount();
							document.body.removeChild(container);
						}

						const handleRejected = (value: string) => {
							reject(new Error(value))
							app.unmount();
							document.body.removeChild(container);
						}

						const title = document.title;
						const hostname = document.location.hostname;
						const signerData = {
							method: 'connect_rpc',
							id: connection._id,
							appName: title.substring(0, 16),
							appUrl: hostname,
							networkByte: options.NETWORK_BYTE
						};

						const props = {
							id: connection._id,
							config: config,
							title: "Connect your wallet",
							signerData
						}

						return () => h(Signer, {
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
			const config = this.providerConfig;
			const options = this.options;
			if (toSign.length > 1) {
				reject(new Error("Only one transaction allowed"));
			} else {
				try {
					const token = Cookies.get('token');
					if (token === undefined) {
						reject(new Error("Please, login first"))
					}
					const withMessage = config.linkDeliveryMethod === 'message' || config.linkDeliveryMethod === 'both';
					const tx = toSign[0];
					const requested = await post<{ id: string, status: 'success' | 'failed' }>('/transaction/signing_request', {
						tx: {
							...tx
						},
						networkByte: this.options.NETWORK_BYTE,
						withMessage
					}, token);
					const { id, status } = requested;
					if (status && status === 'success') {
						if (config.linkDeliveryMethod === 'message') {
							const url = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${id}`;
							const webSocket = new WebSocket(url);
							webSocket.onmessage = function (event) {
								try {
									const data = JSON.parse(event.data) as { tx: SignedTx<SignerTx>, status: 'signed' | 'rejected' };
									if (webSocket.OPEN) {
										webSocket.close();
									}
									if (data.status === 'signed') {
										resolve([data.tx])
									} else {
										reject(new Error(status));
									}
								} catch {
									reject(new Error('something went wrong'));
								}
							};

							webSocket.onclose = function (_event) {
								reject(new Error('timeout'))
							};

							webSocket.onerror = function (error) {
								console.log(error);
								reject(new Error('something went wrong'));
							};
						} else {
							const container = document.createElement('div');
							document.body.appendChild(container);
							const app = createApp({
								setup() {
									const handleConnected = (value: { tx: SignedTx<SignerTx>, status: 'signed' | 'rejected' }) => {
										if (value.status === 'signed') {
											resolve([value.tx])
										} else {
											reject(new Error('user rejected'))
										}
										app.unmount();
										document.body.removeChild(container);
									}

									const handleRejected = (value: string) => {
										reject(new Error(value))
										app.unmount();
										document.body.removeChild(container);
									}

									const signerData = {
										method: 'sign_tx_rpc',
										id,
										networkByte: options.NETWORK_BYTE
									};

									const props = {
										id: id,
										config: config,
										title: "Sign transaction",
										signerData
									}

									return () => h(Signer, {
										...props,
										onConnected: handleConnected,
										onRejected: handleRejected
									});
								}
							});
							app.mount(container);
						}
					} else {
						reject(new Error("signing request failed"))
					}
				} catch (ex) {
					console.log(ex)
					return reject(new Error('something went wrong'));
				}
			}
		})
	}

	public async signMessage(toSign: string | number): Promise<string> {
		return new Promise(async (resolve, reject) => {
			const config = this.providerConfig;
			const options = this.options;
			try {
				const token = Cookies.get('token');
				if (token === undefined) {
					reject(new Error("Please, login first"))
				}
				const withMessage = config.linkDeliveryMethod === 'message' || config.linkDeliveryMethod === 'both';
				const message = `${toSign}`;
				const requested = await post<{ id: string, status: 'success' | 'failed' }>('/message_sign/signing_request', {
					messageToSign: message,
					networkByte: this.options.NETWORK_BYTE,
					withMessage
				}, token);
				const { id, status } = requested;
				if (status && status === 'success') {
					if (config.linkDeliveryMethod === 'message') {
						const url = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${id}`;
						const webSocket = new WebSocket(url);
						webSocket.onmessage = function (event) {
							try {
								const data = JSON.parse(event.data) as { signature: string, status: 'signed' | 'rejected' };
								if (webSocket.OPEN) {
									webSocket.close();
								}
								if (data.status === 'signed') {
									resolve(data.signature)
								} else {
									reject(new Error(status));
								}
							} catch {
								reject(new Error('something went wrong'));
							}
						};

						webSocket.onclose = function (_event) {
							reject(new Error('timeout'))
						};

						webSocket.onerror = function (error) {
							console.log(error);
							reject(new Error('something went wrong'));
						};
					} else {
						const container = document.createElement('div');
						document.body.appendChild(container);
						const app = createApp({
							setup() {
								const handleConnected = (value: { signature: string, status: 'signed' | 'rejected' }) => {
									if (value.status === 'signed') {
										resolve(value.signature)
									} else {
										reject(new Error('user rejected'))
									}
									app.unmount();
									document.body.removeChild(container);
								}

								const handleRejected = (value: string) => {
									reject(new Error(value))
									app.unmount();
									document.body.removeChild(container);
								}

								const signerData = {
									method: 'sign_msg_rpc',
									id,
									networkByte: options.NETWORK_BYTE
								};

								const props = {
									id: id,
									config: config,
									title: "Sign message",
									signerData
								}

								return () => h(Signer, {
									...props,
									onConnected: handleConnected,
									onRejected: handleRejected
								});
							}
						});
						app.mount(container);
					}
				} else {
					reject(new Error("signing request failed"))
				}
			} catch (ex) {
				console.log(ex)
				return reject(new Error('something went wrong'));
			}
		})
	}
}
