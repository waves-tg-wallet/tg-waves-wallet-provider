import { UserData, ConnectOptions, SignerTx, SignedTx } from "@waves/signer";
export type TProviderTelegramType = 'site' | 'webapp';
export interface IProviderTelegram {
    options: ConnectOptions;
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
}
