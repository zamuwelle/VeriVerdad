import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import './Auth.css';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const result = await login(email, password);
		if (!result.success) setError(result.error);
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<h2 className="auth-title">Login</h2>
				{error && <div className="auth-error">{error}</div>}
				<form onSubmit={handleSubmit}>
					<div className="auth-input-group">
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="auth-input"
							required
						/>
					</div>
					<div className="auth-input-group">
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="auth-input"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="auth-eye-button"
							tabIndex="-1"
						>
							{showPassword ? (
								<EyeSlashIcon className="auth-eye-icon" />
							) : (
								<EyeIcon className="auth-eye-icon" />
							)}
						</button>
					</div>
					<button type="submit" className="auth-button">Login</button>
				</form>
				<div className="auth-link">
					Don't have an account? <Link to="/register">Register</Link>
				</div>
			</div>
		</div>
	);
};

export default Login;