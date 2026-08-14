import axios from 'axios'

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/json',
		'X-Secret-Token': import.meta.env.VITE_SECRET_TOKEN
	}
})

api.interceptors.request.use(config => {
	const token = localStorage.getItem('auth_token')
	token && (config.headers.Authorization = `Bearer ${token}`)
	return config
})

api.interceptors.response.use(res => res, error => (error.response?.status === 401 && (clearAuth(), window.location.assign('/login')), Promise.reject(error)))

export const setAuth = ({ token, user }) => (localStorage.setItem('auth_token', token), localStorage.setItem('auth_user', JSON.stringify(user)))

export const clearAuth = () => (localStorage.removeItem('auth_token'), localStorage.removeItem('auth_user'))

export const getAuthToken = () => localStorage.getItem('auth_token')

export const getAuthUser = () => JSON.parse(localStorage.getItem('auth_user'))

export const login = credentials => api.post('/login', credentials).then(({ data }) => data)

export const register = payload => api.post('/register', payload).then(({ data }) => data)

export const logout = () => api.post('/logout').finally(clearAuth)

export const sendMessage = (message, conversationId, verify = false) => api.post('/chat', { message, conversation_id: conversationId, verify })

export const getConversations = () => api.get('/chats')

export const getConversation = id => api.get(`/chats/${id}`).then(({ data }) => ({
	...(data.data || data),
	messages: ((data.data || data).messages || []).map(msg => ({ id: msg.id, role: msg.role, content: msg.content, reasoning: msg.reasoning, created_at: msg.created_at }))
}))

export const deleteConversation = id => api.delete(`/chats/${id}`)

export const updateConversation = (id, title) => api.patch(`/chats/${id}`, { title })

export const getLeaderboard = () => api.get('/leaderboard').then(({ data }) => data.data)