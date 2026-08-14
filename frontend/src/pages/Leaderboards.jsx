import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { getLeaderboard } from '../api'

const rankColors = { 1: 'text-[var(--color-rank1)]', 2: 'text-[var(--color-rank2)]', 3: 'text-[var(--color-rank3)]' }
const rankBg = { 1: 'bg-[var(--color-rank1)]', 2: 'bg-[var(--color-rank2)]', 3: 'bg-[var(--color-rank3)]' }

const sortList = (list, field, dir) => [...list].sort((a, b) => dir === 'asc' ? a[field] - b[field] : b[field] - a[field])

const renderBars = list => {
	const max = Math.max(...list.map(u => u.score), 1)
	return (
		<div className="flex items-end justify-center gap-6 px-6 pt-10 pb-4 overflow-x-auto">
			{list.map((user, index) => (
				<div key={user.id} className="flex flex-col items-center gap-2 shrink-0 w-20">
					<span className="text-xs font-semibold text-[var(--color-text-muted)]">{user.score}</span>
					<div className="w-14 bg-[var(--color-border)] overflow-hidden flex items-end" style={{ height: '400px' }}>
						<div className={(rankBg[index + 1] || 'bg-[var(--color-primary)]') + ' w-full'} style={{ height: `${(user.score / max) * 100}%` }} />
					</div>
					<span className="text-xs text-[var(--color-text)] font-medium text-center whitespace-nowrap">{user.username}</span>
				</div>
			))}
		</div>
	)
}

const renderList = (list, field, dir) => {
	const sorted = sortList(list, field, dir)
	return sorted.map((user, index) => (
		<div key={user.id} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] last:border-b-0 hover:opacity-80">
			<span className={(rankColors[index + 1] || 'text-[var(--color-text-muted)]') + ' font-bold w-6 text-center shrink-0'}>{index + 1}</span>
			<span className="flex-1 text-sm font-semibold text-[var(--color-text)] truncate">{user.username}</span>
			<span className="text-sm text-[var(--color-text-muted)] shrink-0">{user[field]}</span>
		</div>
	))
}

export const Component = () => {
	const [chatLeaderboard, setChatLeaderboard] = useState([])
	const [quizLeaderboard, setQuizLeaderboard] = useState([])
	const [overallLeaderboard, setOverallLeaderboard] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [chatDir, setChatDir] = useState('desc')
	const [quizDir, setQuizDir] = useState('desc')

	useEffect(() => {
		getLeaderboard()
			.then(data => (setChatLeaderboard(data.chatLeaderboard || []), setQuizLeaderboard(data.quizLeaderboard || []), setOverallLeaderboard(data.overallLeaderboard || [])))
			.catch(err => console.error('Failed to fetch leaderboard:', err))
			.finally(() => setLoaded(true))
	}, [])

	return (
		<div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
			<Sidebar />
			<main className="flex-1 md:px-32 pt-16 pb-16">
				<h1 className="text-3xl font-bold text-[var(--color-text)] mb-8 text-center">Leaderboards</h1>

				{loaded && (
					<div className="flex flex-col gap-8 px-4">
						<div>
							{renderBars(overallLeaderboard)}
							<p className="text-center text-sm text-[var(--color-text-muted)] pb-6">Overall</p>
						</div>

						<div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
							<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
								<h2 className="text-lg font-bold text-[var(--color-text)]">Most Veribot History</h2>
								<select value={chatDir} onChange={e => setChatDir(e.target.value)} className="text-xs font-semibold text-[var(--color-text-muted)] bg-transparent border border-[var(--color-border)] rounded-lg px-2 py-1 cursor-pointer hover:opacity-80">
									<option value="desc">Highest first</option>
									<option value="asc">Lowest first</option>
								</select>
							</div>
							{renderList(chatLeaderboard, 'conversations_count', chatDir)}
						</div>

						<div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
							<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
								<h2 className="text-lg font-bold text-[var(--color-text)]">Highest Quiz Score</h2>
								<select value={quizDir} onChange={e => setQuizDir(e.target.value)} className="text-xs font-semibold text-[var(--color-text-muted)] bg-transparent border border-[var(--color-border)] rounded-lg px-2 py-1 cursor-pointer hover:opacity-80">
									<option value="desc">Highest first</option>
									<option value="asc">Lowest first</option>
								</select>
							</div>
							{renderList(quizLeaderboard, 'total_score', quizDir)}
						</div>
					</div>
				)}
			</main>
		</div>
	)
}