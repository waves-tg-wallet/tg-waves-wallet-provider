import { ConnectOptions, SignedTx, SignerTx, UserData } from "@waves/signer";
import { IProviderTelegram } from "./types";
export declare class WebAppProviderTelegram implements IProviderTelegram {
    options: ConnectOptions;
    constructor(options: ConnectOptions);
    login(): Promise<UserData>;
    sign(toSign: Array<SignerTx>): Promise<Array<SignedTx<SignerTx>>>;
}
