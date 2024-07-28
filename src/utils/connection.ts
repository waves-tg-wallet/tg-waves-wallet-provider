import { get } from "./http"

export interface IConnectionResponse {
	_id: string,
	token: string,
	status: 'new' | 'approved' | 'rejected',
	chatId?: number,
	publicKey?: string,
	address?: string
}

export const loadConnection = async (token?: string): Promise<IConnectionResponse> => {
	try {
		const connection = await get<IConnectionResponse>('/connection/info', token);
		return Promise.resolve(connection);
	} catch {}
	return Promise.reject()
}

