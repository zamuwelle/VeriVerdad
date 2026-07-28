const API_URL = import.meta.env.VITE_API_URL;
const SECRET_TOKEN = import.meta.env.VITE_SECRET_TOKEN;

export const api = {
	get: (url, token) => fetch(`${API_URL}${url}`, {
		headers: {
			'X-Secret-Token': SECRET_TOKEN,
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	}).then(async r => {
		const data = await r.json();
		if (!r.ok) throw data;
		return data;
	}),

	post: (url, body, token) => fetch(`${API_URL}${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Secret-Token': SECRET_TOKEN,
			...(token ? { Authorization: `Bearer ${token}` } : {})
		},
		body: JSON.stringify(body)
	}).then(async r => {
		const data = await r.json();
		if (!r.ok) throw data;
		return data;
	})
};