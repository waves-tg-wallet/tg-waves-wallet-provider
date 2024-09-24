import { ConnectOptions, SignedTx, SignerTx, UserData } from "@waves/signer";
import { IProviderTelegram } from "./types";
interface IStyle {
    maxWidth: string;
    height: string;
    lightBgColor: string;
    darkBgColor: string;
    lightTextColor: string;
    darkTextColor: string;
    lightButtonColor: string;
    darkButtonColor: string;
    lightButtonTextColor: string;
    darkButtonTextColor: string;
}
export declare class SiteProviderTelegram implements IProviderTelegram {
    options: ConnectOptions;
    styleParams: IStyle;
    constructor(options: ConnectOptions, style?: Partial<IStyle>);
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
}
export {};
