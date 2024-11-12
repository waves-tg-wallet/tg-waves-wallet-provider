import { ConnectOptions, UserData, SignerTx, SignedTx } from "@waves/signer";
import { IProviderTelegram } from ".";
import { IProviderTelegramConfig, TProviderTelegramType } from "..";

export class FrameProviderTelegram implements IProviderTelegram {
    type: TProviderTelegramType = 'iframe';
    public user: UserData;
    options: ConnectOptions;
    providerConfig: IProviderTelegramConfig;

    constructor(user: UserData, options: ConnectOptions, config: IProviderTelegramConfig) {
        this.options = options;
        this.providerConfig = config;
        this.user = user;
    }

    login(): Promise<UserData> {
        return new Promise((resolve) => {
            resolve(this.user);
        })
    }

    public async sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>> {
        return new Promise(async (resolve, reject) => {
            const timeout = 60000;
            let isResolved = false;

            function handleSignedTx(event: MessageEvent) {
                if (event.origin !== window.origin) {
                    return;
                }

                if (event.data && typeof event.data === 'object' && event.data.status) {
                    window.removeEventListener('message', handleSignedTx);
                    const signResult = event.data as { tx: SignedTx<SignerTx>, status: 'signed' | 'rejected'};
                    if (signResult.status === 'signed') {
                        resolve([signResult.tx])
                    } else {
                        reject(new Error('rejected'));
                    }
                }
            }

            window.addEventListener('message', handleSignedTx);
            const message = {
                method: 'sign_tx_frame',
                networkByte: this.options.NETWORK_BYTE,
                tx: toSign
            }
            window.parent.postMessage(message, '*');
            
            setTimeout(() => {
                if (!isResolved) {
                    window.removeEventListener('message', handleSignedTx);
                    reject(new Error('timeout'))
                }
            }, timeout);
        });
    };
}
