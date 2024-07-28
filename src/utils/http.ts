import axios from 'axios';

export function get<T>(pathname: string, token?: string): Promise<T> {
	const headers: { [key: string]: string} = {};
	if (token) {
		headers['token'] = token;
	}
	return new Promise((resolve, reject) => {
		const url = `${import.meta.env.VITE_WEB_API_URL}${pathname}`
		axios
			.get<T>(url, {
				headers
			})
			.then((resp) => {
				resolve(resp.data);
			})
			.catch((ex) => {
				console.log(ex);
				reject(ex);
			});
	});
}

export function post<T>(pathname: string, body: {}, token?: string): Promise<T> {
	const headers: { [key: string]: string} = {};
	if (token) {
		headers['token'] = token;
	}
	return new Promise((resolve, reject) => {
		const url = `${import.meta.env.VITE_WEB_API_URL}${pathname}`
		axios
			.post<T>(url, body, {
				headers
			})
			.then((resp) => {
				resolve(resp.data);
			})
			.catch((ex) => {
				console.log(ex);
				reject(ex);
			});
	});
}