import { TProviderTelegramType } from "../types";
export interface IConnectionResponse {
    _id: string;
    token: string;
    status: 'new' | 'approved' | 'rejected';
    chatId?: number;
    publicKey?: string;
    address?: string;
}
export declare const loadConnection: (body: {
    providerType: TProviderTelegramType;
    url: string;
}, token?: string) => Promise<IConnectionResponse>;
