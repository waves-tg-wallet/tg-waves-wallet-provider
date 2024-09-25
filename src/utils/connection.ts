import { TProviderTelegramType } from "../types";
import { post } from "./http"

export interface IConnectionResponse {
	_id: string,
	token: string,
	status: 'new' | 'approved' | 'rejected',
	chatId?: number,
	publicKey?: string,
	address?: string
}

export const loadConnection = async (body: {providerType: TProviderTelegramType, url: string }, token?: string): Promise<IConnectionResponse> => {
	try {
		const connection = await post<IConnectionResponse>('/connection/info', body, token);
		return Promise.resolve(connection);
	} catch {}
	return Promise.reject()
}

