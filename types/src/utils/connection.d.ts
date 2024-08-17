export interface IConnectionResponse {
    _id: string;
    token: string;
    status: 'new' | 'approved' | 'rejected';
    chatId?: number;
    publicKey?: string;
    address?: string;
}
export declare const loadConnection: (token?: string) => Promise<IConnectionResponse>;
