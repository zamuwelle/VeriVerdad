import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			api.get('/user', token)
				.then(data => {
					if (data.id) setUser(data);
					else localStorage.removeItem('token');
					setLoading(false);
				})
				.catch(() => {
					localStorage.removeItem('token');
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
	}, []);

	const register = async (name, email, password) => {
		try {
			const data = await api.post('/register', { name, email, password });

			if (data.errors) {
				const errorMessages = Object.values(data.errors).flat().join(' ');
				return { success: false, error: errorMessages };
			}

			if (data.token) {
				localStorage.setItem('token', data.token);
				setUser(data.user);
				return { success: true };
			}

			return { success: false, error: data.message || 'Registration failed' };
		} catch (error) {
			return {
				success: false,
				error: error.message || 'Network error - please try again'
			};
		}
	};

	const login = async (email, password) => {
		try {
			const data = await api.post('/login', { email, password });

			if (data.errors) {
				const errorMessages = Object.values(data.errors).flat().join(' ');
				return { success: false, error: errorMessages };
			}

			if (data.token) {
				localStorage.setItem('token', data.token);
				setUser(data.user);
				return { success: true };
			}

			return { success: false, error: data.message || 'Login failed' };
		} catch (error) {
			return {
				success: false,
				error: error.message || 'Network error - please try again'
			};
		}
	};

	const logout = () => {
		const token = localStorage.getItem('token');
		if (token) api.post('/logout', null, token);
		localStorage.removeItem('token');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, register, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};