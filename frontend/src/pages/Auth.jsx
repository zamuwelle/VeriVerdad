import { useState, useEffect } from 'react'
import { useTitle } from '../hooks/useTitle'
import { useLocation, Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { login, register, setAuth } from '../api'
import { Eye } from '../components/Icons'

export const PasswordField = ({ id, name, value, onChange, autoComplete, py, errorText }) => {
	const [show, setShow] = useState(false)
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Password</label>
			<div className="relative flex items-center">
				<input id={id} name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange} required autoComplete={autoComplete} className={`w-full px-4 ${py} border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)] pr-11`} />
				<button type="button" tabIndex={-1} onClick={() => setShow(!show)} className={`absolute right-2 p-1.5 rounded-md flex items-center justify-center opacity-60 hover:opacity-80 ${show ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-faint)]'}`}>
					<Eye visible={show} />
				</button>
			</div>
			<span className="text-xs text-[var(--color-error)] font-medium min-h-[16px]">{errorText || ''}</span>
		</div>
	)
}

export const Component = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const isRegister = location.pathname === '/register'
	useTitle(isRegister ? 'Create Account — VeriVerdad' : 'Sign In — VeriVerdad')

	const [loginForm, setLoginForm] = useState({ email: '', password: '' })
	const [regForm, setRegForm] = useState({ username: '', email: '', password: '' })

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: res => (setAuth(res.data), navigate('/veribot'))
	})

	const regMutation = useMutation({
		mutationFn: register,
		onSuccess: res => (setAuth(res.data), navigate('/veribot'))
	})

	useEffect(() => {
		loginMutation.reset()
		regMutation.reset()
		setLoginForm({ email: '', password: '' })
		setRegForm({ username: '', email: '', password: '' })
	}, [location.pathname])

	const loginErrors = loginMutation.error?.response?.data?.errors
	const loginMsg = loginMutation.error?.response?.data?.message
	const regErrors = regMutation.error?.response?.data?.errors

	return (
		<div className="min-h-screen flex justify-center items-center bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8 box-border">
			<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-[440px] lg:max-w-[960px] w-full lg:min-h-[600px] shadow-sm relative overflow-hidden flex flex-col lg:flex-row">
				<div className={`w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center ${isRegister ? 'max-lg:hidden' : 'block'}`}>
					<div className="flex items-center gap-3 mb-6">
						<img src="/logo.png" alt="" className="h-8 w-auto object-contain" />
						<span className="text-sm sm:text-base font-bold tracking-wider text-[var(--color-primary)]">VERIVERDAD</span>
					</div>
					<div className="flex flex-col gap-1 mb-6">
						<h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">Welcome Back</h1>
						<p className="text-sm text-[var(--color-text-muted)]">Sign in to continue verifying feeds</p>
					</div>
					<form key={location.pathname} onSubmit={e => (e.preventDefault(), loginMutation.mutate(loginForm))} className="flex flex-col gap-4 w-full">
						<div className={`min-h-[42px] flex items-center justify-center bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 px-3 py-2 rounded-lg text-xs font-medium text-center ${loginMutation.isError && !loginMsg && !loginErrors ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
							Something went wrong
						</div>
						<div className="flex flex-col gap-1.5">
							<label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Email Address</label>
							<input id="login-email" name="email" type="email" value={loginForm.email} onChange={e => (loginMutation.reset(), setLoginForm({ ...loginForm, [e.target.name]: e.target.value }))} required autoComplete="email" className="px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]" />
							<span className="text-xs text-[var(--color-error)] font-medium min-h-[16px]">{loginErrors?.email?.[0] || loginMsg || ''}</span>
						</div>
						<PasswordField id="login-password" name="password" value={loginForm.password} onChange={e => (loginMutation.reset(), setLoginForm({ ...loginForm, [e.target.name]: e.target.value }))} autoComplete="current-password" py="py-3" errorText={loginErrors?.password?.[0] || loginMsg} />
						<button type="submit" disabled={loginMutation.isPending} className="mt-2 py-3.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
							{loginMutation.isPending ? 'Signing In...' : 'Sign In'}
						</button>
						<p className="text-center text-xs text-[var(--color-text-muted)] mt-2 lg:hidden">
							Don't have an account? <Link to="/register" className="text-[var(--color-primary)] font-bold hover:opacity-80">Register</Link>
						</p>
					</form>
				</div>

				<div className={`w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center ${isRegister ? 'block' : 'max-lg:hidden'}`}>
					<div className="flex items-center gap-3 mb-6">
						<img src="/logo.png" alt="" className="h-8 w-auto object-contain" />
						<span className="text-sm sm:text-base font-bold tracking-wider text-[var(--color-primary)]">VERIVERDAD</span>
					</div>
					<div className="flex flex-col gap-1 mb-6">
						<h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">Create Account</h1>
						<p className="text-sm text-[var(--color-text-muted)]">Join the network of truth-seekers</p>
					</div>
					<form key={location.pathname} onSubmit={e => (e.preventDefault(), regMutation.mutate(regForm))} className="flex flex-col gap-3.5 w-full">
						<div className={`min-h-[42px] flex items-center justify-center bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 px-3 py-2 rounded-lg text-xs font-medium text-center ${regMutation.isError && !regErrors ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
							{regMutation.error?.response?.data?.message || 'Something went wrong'}
						</div>
						<div className="flex flex-col gap-1.5">
							<label htmlFor="reg-username" className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Username</label>
							<input id="reg-username" name="username" type="text" value={regForm.username} onChange={e => (regMutation.reset(), setRegForm({ ...regForm, [e.target.name]: e.target.value }))} required autoComplete="username" className="px-4 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]" />
							<span className="text-xs text-[var(--color-error)] font-medium min-h-[16px]">{regErrors?.username?.[0] || ''}</span>
						</div>
						<div className="flex flex-col gap-1.5">
							<label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Email Address</label>
							<input id="reg-email" name="email" type="email" value={regForm.email} onChange={e => (regMutation.reset(), setRegForm({ ...regForm, [e.target.name]: e.target.value }))} required autoComplete="email" className="px-4 py-2.5 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]" />
							<span className="text-xs text-[var(--color-error)] font-medium min-h-[16px]">{regErrors?.email?.[0] || ''}</span>
						</div>
						<PasswordField id="reg-password" name="password" value={regForm.password} onChange={e => (regMutation.reset(), setRegForm({ ...regForm, [e.target.name]: e.target.value }))} autoComplete="new-password" py="py-2.5" errorText={regErrors?.password?.[0]} />
						<button type="submit" disabled={regMutation.isPending} className="mt-2 py-3 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
							{regMutation.isPending ? 'Creating Account...' : 'Create Account'}
						</button>
						<p className="text-center text-xs text-[var(--color-text-muted)] mt-2 lg:hidden">
							Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:opacity-80">Login</Link>
						</p>
					</form>
				</div>

				<div className={`hidden lg:flex absolute top-0 bottom-0 left-0 w-1/2 bg-[var(--color-primary)] text-white p-12 flex-col items-center justify-center text-center z-10 ${isRegister ? 'translate-x-0' : 'translate-x-full'}`}>
					<div className="flex flex-col items-center gap-3">
						<h2 className="text-3xl font-extrabold tracking-tight text-white">{isRegister ? 'Welcome Back!' : 'Spot the Truth'}</h2>
						<p className="text-sm opacity-80 max-w-xs leading-relaxed text-[var(--color-surface)]">
							{isRegister ? 'Sign in to trace primary sources, unmask clout bias, and check the receipts.' : 'Join VeriVerdad & Veribot to master source verification before hitting share.'}
						</p>
						<Link to={isRegister ? '/login' : '/register'} className="mt-4 px-8 py-3 border border-white/40 bg-white/10 rounded-lg text-sm font-bold text-white hover:opacity-80">
							{isRegister ? 'Sign In' : 'Create Account'}
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}