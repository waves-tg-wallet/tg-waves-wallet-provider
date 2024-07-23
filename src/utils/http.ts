import axios from 'axios';
import Cookies from 'js-cookie'

export function get<T>(url: string): Promise<T> {
	const headers: { [key: string]: string} = {};
	const token = Cookies.get('token');
	if (token) {
		headers['token'] = token;
	}
	return new Promise((resolve, reject) => {
		const path = `${import.meta.env.VITE_WEB_API_URL}${url}`
		axios
			.get<T>(path, {
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