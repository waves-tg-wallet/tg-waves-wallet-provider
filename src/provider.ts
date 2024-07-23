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

import ConnectionView from './views/ConnectionView.vue'
import { createApp, h } from "vue";
import { loadConnection } from "./utils/connection";
import { get } from "./utils/http";

// login() {
//     return new Promise((resolve, reject) => {
//       const container = document.createElement('div');
//       document.body.appendChild(container);

//       const app = createApp({
//         setup() {
//           const handleSeedSubmit = (seed) => {
//             this.seed = seed;
//             resolve({ address: 'address_generated_from_seed' }); // генерируйте адрес из seed
//             app.unmount();
//             document.body.removeChild(container);
//           };

//           return { handleSeedSubmit };
//         },
//         render() {
//           return <SeedInput onSubmit={this.handleSeedSubmit} />;
//         }
//       });

//       app.mount(container);
//     });
//   }


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
				if (connection.status === 'approved' && connection.publicKey !== undefined) {
					resolve({
						address: connection.address!,
						publicKey: connection.publicKey
					});
				}
				const container = document.createElement('div');
				document.body.appendChild(container);
				const app = createApp({
					setup() {
						const handleConnected = (value: { publicKey: string, address: string }) => {
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
		const cookieName = 'token';
		document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
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
		throw new Error("Method not implemented.");
	}
}
