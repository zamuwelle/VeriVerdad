import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { getUsers } from '../api'

export const Component = () => {
	const [users, setUsers] = useState([])   // will hold the list of users
	const [loading, setLoading] = useState(true)

	// Fetch users once when the page loads
	useEffect(() => {
		getUsers()
			.then(data => setUsers(data))   // save users into state
			.catch(err => console.error('Failed to fetch users:', err))
			.finally(() => setLoading(false))
	}, [])

	return (
		<>
			<div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
				<Sidebar />
				<main className="flex-1 md:px-64 pt-16">
					<h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8 text-center">Leaderboards</h1>
					<div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
						{loading && <p className="text-center">Loading...</p>}

						{!loading && (!users ? [] : users).length === 0 && (
							<p className="text-center">No other users yet.</p>
						)}

						{!loading && (!users ? [] : users).map((user, index) => (
							<p key={user.id} className="text-center">
								{index + 1}. {user.username}
							</p>
						))}
					</div>
				</main>
			</div>
		</>
	)
}