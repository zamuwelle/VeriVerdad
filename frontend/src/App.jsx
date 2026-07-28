import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

const PrivateRoute = ({ children }) => {
	const { user } = useAuth()
	return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
	const { user } = useAuth()
	return user ? <Navigate to="/dashboard" /> : children
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
				<Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
				<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
				<Route path="/" element={<Navigate to="/dashboard" />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App