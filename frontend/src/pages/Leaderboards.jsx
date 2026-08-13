import { useState } from 'react'
import { useTitle } from '../hooks/useTitle'
import { Sidebar } from '../components/Sidebar'

export const Component = () => {
	useTitle('Leaderboards — VeriVerdad')
	return (
		<>
			<div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
				<Sidebar />
				<main className="flex-1 md:px-64 pt-16">
					<h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8 text-center">Leaderboards</h1>
					<div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
					<p className='text-center'>coming soon hehe :D</p>
				</div>
				</main>
			</div>
		</>
	)
}