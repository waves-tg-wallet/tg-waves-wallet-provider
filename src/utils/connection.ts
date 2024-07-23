import { get } from "./http"

export interface IConnectionResponse {
	_id: string,
	token: string,
	appUrl?: string,
	appName?: string,
	chatId?: number,
	createdAt: Date,
	status: 'new' | 'approved' | 'rejected',
	expired?: Date,
	publicKey?: string,
	address?: string
}

export const loadConnection = async (): Promise<IConnectionResponse> => {
	try {
		const connection = await get<IConnectionResponse>('/info');
		return Promise.resolve(connection);
	} catch {}
	return Promise.reject()
}

