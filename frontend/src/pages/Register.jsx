import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import './Auth.css';

const Register = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState('');
	const { register } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (password !== passwordConfirmation) {
			setError('Passwords do not match');
			return;
		}
		const result = await register(name, email, password);
		if (!result.success) setError(result.error);
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<h2 className="auth-title">Register</h2>
				{error && <div className="auth-error">{error}</div>}
				<form onSubmit={handleSubmit}>
					<div className="auth-input-group">
						<input
							type="text"
							placeholder="Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="auth-input"
							required
						/>
					</div>
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
					<div className="auth-input-group">
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="Confirm Password"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
							className="auth-input"
							required
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="auth-eye-button"
							tabIndex="-1"
						>
							{showConfirmPassword ? (
								<EyeSlashIcon className="auth-eye-icon" />
							) : (
								<EyeIcon className="auth-eye-icon" />
							)}
						</button>
					</div>
					<button type="submit" className="auth-button">Register</button>
				</form>
				<div className="auth-link">
					Already have an account? <Link to="/login">Login</Link>
				</div>
			</div>
		</div>
	);
};

export default Register;