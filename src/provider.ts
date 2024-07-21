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

import AuthorizationView from './views/AuthorizationView.vue'
import { createApp, h } from "vue";

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

    isSignAndBroadcastByProvider?: boolean | undefined;
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
			const container = document.createElement('div');
			document.body.appendChild(container);
			const app = createApp({
				setup() {
					const handleAuthorized = (value: string) => {
						resolve({
							address: value,
							publicKey: 'public key will be here'
						});
						app.unmount();
						document.body.removeChild(container);
					}

					const handleRejected = (value: string) => {
						reject(new Error(value))
						app.unmount();
						document.body.removeChild(container);
					}

					return () => h(AuthorizationView, {
						onAuthorized: handleAuthorized,
						onRejected: handleRejected
					});
				}
			});
			app.mount(container);
		});
    }

    logout(): Promise<void> {
        throw new Error("Method not implemented.");
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
