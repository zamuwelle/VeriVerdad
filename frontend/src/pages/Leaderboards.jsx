import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { getUsers } from '../api'

export const Component = () => {
	const [users, setUsers] = useState([])   // will hold the list of users
	const [loading, setLoading] = useState(true)
	const rankColors = {
		1: 'text-[var(--color-rank1)]',
		2: 'text-[var(--color-rank2)]',
		3: 'text-[var(--color-rank3)]',
	};

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
				<main className="flex-1 md:px-32 pt-16">
					<h1 className="text-4xl font-bold text-[var(--color-text)] mb-8 text-center">Leaderboards</h1>
					<div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
						{loading && <p className="text-center">Loading...</p>}

						{!loading && (!users ? [] : users).length === 0 ?
							<p className="text-center">No other users yet.</p>
						: (
							<>
							<h2 className='text-3xl font-bold text-[var(--color-text-muted)] mb-8 text-center'>
								Most Veribot History
							</h2>
							{users.map((user, index) => {
								const rank = index + 1;
								return (
									<div className='flex text-2xl p-2 md:px-16 border border-[var(--color-border)]'>
										<p className={rankColors[rank] + ' font-bold pr-8'}>{rank}.</p>

										<p className='flex-1'>{user.username}</p>
										<p>{user.conversations_count}</p>
									</div>
								);
							})}
							</>
						)}

					</div>
				</main>
			</div>
		</>
	)
}