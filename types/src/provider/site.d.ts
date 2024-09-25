import { ConnectOptions, SignedTx, SignerTx, UserData } from "@waves/signer";
import { IProviderTelegram, IStyle } from "../types";
export declare class SiteProviderTelegram implements IProviderTelegram {
    options: ConnectOptions;
    styleParams: IStyle;
    constructor(options: ConnectOptions, style?: IStyle);
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
}
