import axios from 'axios';

export function get<T>(url: string): Promise<T> {
	return new Promise((resolve, reject) => {
		const path = `${import.meta.env.VITE_WEB_API_URL}${url}`
		axios
			.get<T>(path)
			.then((resp) => {
				resolve(resp.data);
			})
			.catch((ex) => {
				console.log(ex);
				reject(ex);
			});
	});
}