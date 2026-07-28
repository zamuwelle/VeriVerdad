import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
	const { user, logout } = useAuth();

	return (
		<div className="dashboard-page">
			<div className="dashboard-container">
				<h2>Hello, {user?.name}!</h2>
				<button onClick={logout}>Logout</button>
			</div>
		</div>
	);
};

export default Dashboard;