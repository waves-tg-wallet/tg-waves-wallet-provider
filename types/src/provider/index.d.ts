import { AuthEvents, ConnectOptions, Handler, Provider, SignedTx, SignerTx, TypedData, UserData } from "@waves/signer";
import { IStyle } from "../types";
export declare class ProviderTelegram implements Provider {
    user: UserData | null;
    private options;
    private selectedProvider;
    private styleParams;
    constructor(styleParams?: IStyle);
    isSignAndBroadcastByProvider?: false;
    on<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider;
    once<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider;
    off<EVENT extends keyof AuthEvents>(event: EVENT, handler: Handler<AuthEvents[EVENT]>): Provider;
    connect(options: ConnectOptions): Promise<void>;
    login(): Promise<UserData>;
    logout(): Promise<void>;
    signMessage(data: string | number): Promise<string>;
    signTypedData(data: Array<TypedData>): Promise<string>;
    sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
    sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;
}
