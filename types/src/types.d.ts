import { UserData, ConnectOptions, SignerTx, SignedTx } from "@waves/signer";
export type TProviderTelegramType = 'site' | 'webapp';
export interface IProviderTelegram {
    options: ConnectOptions;
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
}
export interface IStyle {
    maxWidth?: string;
    height?: string;
    lightBgColor?: string;
    darkBgColor?: string;
    lightTextColor?: string;
    darkTextColor?: string;
    lightButtonColor?: string;
    darkButtonColor?: string;
    lightButtonTextColor?: string;
    darkButtonTextColor?: string;
}
