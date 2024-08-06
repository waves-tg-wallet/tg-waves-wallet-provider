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
        return new Promise(async (resolve, reject) => {
            const token = uuidv4();
            const queryString = window.btoa(JSON.stringify({
                method: 'connect_ws',
                token,
                networkByte: this.options.NETWORK_BYTE
            }));
            const pathname = `?startapp=${queryString}`;
            const url = `${import.meta.env.VITE_WEB_APP_URL}${pathname}`;
            const wsUrl = `${import.meta.env.VITE_WS_PROVIDER_URL}/?token=${token}`;
            const webSocket = new WebSocket(wsUrl);

            webSocket.onmessage = function (event) {
                try {
                    const data = JSON.parse(event.data) as UserData;
                    if (webSocket.OPEN) {
                        webSocket.close();
                    }
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
        })
	}

	async logout(): Promise<void> {
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
	public async sign(toSign: Array<SignerTx>): Promise<Array<SignedTx<SignerTx>>> {
		return new Promise(async (resolve, reject) => {
			if (toSign.length > 1) {
				reject("Only one transaction allowed");
			} else {
				try {
					const token = uuidv4();
					const tx = window.btoa(JSON.stringify(toSign[0]));
					const queryString = window.btoa(JSON.stringify({
                        method: 'sign_tx_ws',
                        token,
                        networkByte: this.options.NETWORK_BYTE,
                        tx
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
				} catch (ex) {
					console.log(ex)
					return reject();
				}
			}
		})
	}
}
